/**
 * Normalizes a string by removing special characters, spaces, and converting to lowercase
 * This helps with matching similar strings with different formatting
 * 
 * @param input The string to normalize
 * @returns The normalized string
 */
export function normalizeString(input: string): string {
  if (!input) return '';
  
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
    .trim();
}

/**
 * Calculates the similarity between two strings using Levenshtein distance
 * 
 * @param str1 First string
 * @param str2 Second string
 * @returns A value between 0 and 1, where 1 means identical
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);
  
  if (normalized1 === normalized2) return 1;
  if (!normalized1 || !normalized2) return 0;
  
  const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
  const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;
  
  // Calculate Levenshtein distance
  const costs = new Array(shorter.length + 1);
  for (let i = 0; i <= shorter.length; i++) {
    costs[i] = i;
  }
  
  for (let i = 1; i <= longer.length; i++) {
    costs[0] = i;
    let nw = i - 1;
    for (let j = 1; j <= shorter.length; j++) {
      const cj = Math.min(
        costs[j] + 1,
        costs[j - 1] + 1,
        nw + (longer.charAt(i - 1) === shorter.charAt(j - 1) ? 0 : 1)
      );
      nw = costs[j];
      costs[j] = cj;
    }
  }
  
  // Convert to similarity score (0-1)
  return (longer.length - costs[shorter.length]) / longer.length;
} 