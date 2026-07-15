import axios from 'axios';
import { AtCoderContest, AtCoderUserInfo } from '../types/api';

const KENKOOO_BASE_URL = 'https://kenkoooo.com/atcoder/atcoder-api';
const ATCODER_BASE_URL = 'https://atcoder.jp';

export const atcoderApi = {
  /**
   * Returns information about upcoming contests.
   * Uses Kenkoooo's resources/contests.json
   */
  getContestList: async (): Promise<AtCoderContest[]> => {
    let upcoming: any[] = [];
    const nowSeconds = Math.floor(Date.now() / 1000);

    // 1. Try Scraping Official AtCoder Site (Primary)
    try {
        const officialPage = await axios.get(`${ATCODER_BASE_URL}/contests`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const html = officialPage.data as string;
        
        // Extract Upcoming Contests Table
        const upcomingSection = html.split('id="contest-table-upcoming"')[1];
        if (upcomingSection) {
            const tbody = upcomingSection.split('<tbody>')[1].split('</tbody>')[0];
            const rows = tbody.split('<tr');
            
            rows.forEach(row => {
                if (!row.trim()) return;
                
                // Extract Title & Path
                // <a href="/contests/abc387">AtCoder Beginner Contest 387</a>
                const titleMatch = row.match(/<a href="(\/contests\/[^"]+)">([^<]+)<\/a>/);
                
                // Extract Time (ISO-ish format in text)
                // <time class="fixtime fixtime-full">2025-01-11 21:00:00+0900</time>
                const timeMatch = row.match(/>(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\+0900)</);
                
                if (titleMatch && timeMatch) {
                    const path = titleMatch[1];
                    let title = titleMatch[2];
                    const timeStr = timeMatch[1];
                    const id = path.split('/').pop() || 'unknown';
                    
                    // Parse Time (Japan Time +0900)
                    const cleanTime = timeStr.replace(' ', 'T').replace('+0900', '+09:00');
                    const startTime = new Date(cleanTime).getTime() / 1000;
                    
                    // Filter Logic:
                    // 1. Remove "Job" / "Forecast"
                    if (title.toLowerCase().includes('job') || title.toLowerCase().includes('forecast')) return;

                    // 2. Decode specific HTML entities if present (e.g. &amp;)
                    title = title.replace(/&amp;/g, '&');

                    upcoming.push({
                        id: id,
                        start_epoch_second: startTime,
                        duration_second: 6000, // Default 100min fallback
                        title: title,
                        rate_change: '-' 
                    });
                }
            });
        }
    } catch (scrapeError) {
        console.warn('AtCoder scrape failed, falling back to Kenkoooo:', scrapeError);
    }

    // 2. Fallback to Kenkoooo if Scraping returned nothing
    if (upcoming.length === 0) {
        try {
            const response = await axios.get('https://kenkoooo.com/atcoder/resources/contests.json');
            const allContests = response.data;
            
            upcoming = allContests.filter((c: any) => {
                const isFuture = c.start_epoch_second > nowSeconds;
                const title = c.title.toLowerCase();
                const isClean = !title.includes('forecast') && !title.includes('job');
                return isFuture && isClean;
            });
        } catch (apiError) {
            console.error('AtCoder Kenkoooo API failed:', apiError);
            throw apiError; 
        }
    }

    return upcoming;
  },

  /**
   * Returns information about a user.
   * Combines data from AtCoder's hidden history API and Kenkoooo's V2 user info API.
   */
  getUserInfo: async (handle: string): Promise<AtCoderUserInfo> => {
    try {
      // Fetch in parallel: History, Kenkoooo, AND Official Profile Page (for Rank)
      const [historyResponse, kenkooooResponse, profileResponse] = await Promise.allSettled([
        axios.get(`${ATCODER_BASE_URL}/users/${handle}/history/json`),
        axios.get(`${KENKOOO_BASE_URL}/v2/user_info?user=${handle}`),
        axios.get(`${ATCODER_BASE_URL}/users/${handle}`, {
             headers: { 'User-Agent': 'Mozilla/5.0' },
             validateStatus: () => true // Don't throw on 404, handle below
        })
      ]);

      // Process History (for Rating and Max Rating)
      let rating = 0;
      let maxRating = 0;
      let historyData: any[] = [];
      
      if (historyResponse.status === 'fulfilled' && historyResponse.value.data) {
        historyData = historyResponse.value.data;
        if (Array.isArray(historyData) && historyData.length > 0) {
          const lastEntry = historyData[historyData.length - 1];
          rating = lastEntry.NewRating;
          maxRating = historyData.reduce((max, entry) => Math.max(max, entry.NewRating), 0);
        }
      }

      // Process Kenkoooo Data (for Problems Solved)
      let problemsSolved = 0;
      if (kenkooooResponse.status === 'fulfilled' && kenkooooResponse.value.data) {
        problemsSolved = kenkooooResponse.value.data.accepted_count || 0;
      }

      // Process Official Profile HTML (for Rank/Tier)
      let scrapedRank: string | undefined;
      // AtCoder displays rank like <h3><b>6 Dan</b> ...</h3>
      // We look for patterns like "6 Dan", "1 Kyu", "7 Dan"
      if (profileResponse.status === 'fulfilled' && profileResponse.value.data) {
          const html = profileResponse.value.data as string;
          // Regex to find "X Dan" or "Y Kyu" or "Zth Dan/Kyu"
          // Typically inside a <b> tag or just text in the header
          // e.g. <b>6 Dan</b>
          const rankMatch = html.match(/<b>\s*((?:\d+)\s*(?:Dan|Kyu))\s*<\/b>/i);
          if (rankMatch) {
              scrapedRank = rankMatch[1].trim();
          } else {
             // Fallback: Try looser match if the <b> structure varies
             // Look for "X Dan" followed by username or similar structure
             const looseMatch = html.match(/(\d+\s*(?:Dan|Kyu))/i);
             if (looseMatch) scrapedRank = looseMatch[1].trim();
          }
      }

      return {
        handle,
        rating,
        maxRating,
        problemsSolved,
        totalContests: historyData.length,
        avatar: undefined, 
        rank: scrapedRank // Pass the scraped rank
      };

    } catch (error) {
      console.error('AtCoder getUserInfo error:', error);
      throw error;
    }
  }
};
