export type PlatformId =
  | "codeforces"
  | "leetcode"
  | "codechef"
  | "atcoder"
  | "geeksforgeeks"
  | "topcoder"
  | "hackerrank";

export interface Platform {
  id: PlatformId;
  name: string;
  icon: string; // Icon name or URL
  color: string; // Brand color
  baseUrl: string;
}

export const PLATFORMS: Record<PlatformId, Platform> = {
  codeforces: {
    id: "codeforces",
    name: "Codeforces",
    icon: "code-braces", // Material Community Icon
    color: "#1f8dd6",
    baseUrl: "https://codeforces.com",
  },
  leetcode: {
    id: "leetcode",
    name: "LeetCode",
    icon: "code-tags",
    color: "#FFA116", // Official LeetCode Orange-Yellow
    baseUrl: "https://leetcode.com",
  },
  codechef: {
    id: "codechef",
    name: "CodeChef",
    icon: "chef-hat",
    color: "#5b4638",
    baseUrl: "https://www.codechef.com",
  },
  atcoder: {
    id: "atcoder",
    name: "AtCoder",
    icon: "alpha-a-circle",
    color: "#FFFFFF",
    baseUrl: "https://atcoder.jp",
  },
  geeksforgeeks: {
    id: "geeksforgeeks",
    name: "GeeksforGeeks",
    icon: "code-json",
    color: "#2F8D46",
    baseUrl: "https://geeksforgeeks.org",
  },
  topcoder: {
    id: "topcoder",
    name: "TopCoder",
    icon: "code-brackets",
    color: "#F91216", // TopCoder Red
    baseUrl: "https://topcoder.com",
  },
  hackerrank: {
    id: "hackerrank",
    name: "HackerRank",
    icon: "code-braces",
    color: "#2EC866",
    baseUrl: "https://hackerrank.com",
  },
};
