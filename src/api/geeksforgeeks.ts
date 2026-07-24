import axios from "axios";

export interface GeeksForGeeksUserInfo {
  handle: string;
  codingScore: number;
  problemsSolved: number;
  avatar?: string;
  name?: string;
}

export const geeksforgeeksApi = {
  getUserInfo: async (handle: string): Promise<GeeksForGeeksUserInfo | null> => {
    try {
      // GFG Profile URL
      const url = `https://www.geeksforgeeks.org/user/${handle}/`;
      
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const html = response.data;
      
      // Simple validation that it's a valid profile page and not a 404 redirect
      if (!html || html.includes("Page Not Found") || html.includes("404 Error")) {
        throw new Error("User not found");
      }

      // We use Regex to extract the embedded JSON state or HTML text
      
      // 1. Problems Solved
      let problemsSolved = 0;
      const problemsMatch = html.match(/problems_solved(?:\\\"|")?\s*:\s*(\d+)/i) || 
                            html.match(/Total Problem Solved.*?<span[^>]*>(\d+)<\/span>/i) ||
                            html.match(/total_problem_solved.*?(\d+)/i);
      
      if (problemsMatch && problemsMatch[1]) {
        problemsSolved = parseInt(problemsMatch[1], 10);
      }

      // 2. Coding Score
      let codingScore = 0;
      const scoreMatch = html.match(/coding_score(?:\\\"|")?\s*:\s*(\d+)/i) || 
                         html.match(/overall_coding_score(?:\\\"|")?\s*:\s*(\d+)/i) ||
                         html.match(/Overall Coding Score.*?<span[^>]*>(\d+)<\/span>/i);
                         
      if (scoreMatch && scoreMatch[1]) {
        codingScore = parseInt(scoreMatch[1], 10);
      }

      // 3. Extract avatar if possible
      let avatar = undefined;
      const avatarMatch = html.match(/profile_image_url(?:\\\"|")?\s*:\s*(?:\\\"|")([^\\"]+)(?:\\\"|")/i);
      if (avatarMatch && avatarMatch[1]) {
        avatar = avatarMatch[1].replace(/\\\//g, '/'); // Unescape forward slashes
      }

      // 4. Extract Name
      let name = handle;
      const nameMatch = html.match(/name(?:\\\"|")?\s*:\s*(?:\\\"|")([^\\"]+)(?:\\\"|")/i);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1];
      }

      return {
        handle,
        codingScore,
        problemsSolved,
        avatar,
        name,
      };

    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new Error("User not found");
      }
      console.error("GFG getUserInfo error:", error);
      throw error;
    }
  },
};
