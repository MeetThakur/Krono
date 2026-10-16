export interface POTD {
    platform: 'leetcode' | 'geeksforgeeks';
    title: string;
    url: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Unknown' | 'Click to Solve';
    date: string;
}

export const potdService = {
    getLeetCodePOTD: async (): Promise<POTD | null> => {
        try {
            const query = `
                query questionOfToday {
                    activeDailyCodingChallengeQuestion {
                        date
                        link
                        question {
                            title
                            difficulty
                        }
                    }
                }
            `;

            const response = await fetch('https://leetcode.com/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0' // Sometimes needed
                },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();
            const challenge = data.data.activeDailyCodingChallengeQuestion;

            return {
                platform: 'leetcode',
                title: challenge.question.title,
                url: `https://leetcode.com${challenge.link}`,
                difficulty: challenge.question.difficulty,
                date: challenge.date,
            };
        } catch (error) {
            console.error('Failed to fetch LeetCode POTD:', error);
            return null;
        }
    },

    getGfgPOTD: async (): Promise<POTD | null> => {
        // GFG does not have a public API for POTD.
        // We return a static card that links to the POTD page.
        return {
            platform: 'geeksforgeeks',
            title: "Solve Today's Problem",
            url: "https://practice.geeksforgeeks.org/problem-of-the-day",
            difficulty: 'Click to Solve',
            date: new Date().toISOString().split('T')[0],
        };
    }
};
