/**
 * Normalizes a string for comparison
 * Converts to lowercase, removes extra spaces, and special characters
 * Also standardizes common milestone terminology
 */
export function normalizeString(str: string): string {
  if (!str) return '';
  
  // Convert to lowercase and trim
  let normalized = str.toLowerCase().trim();
  
  // Replace common variations with standard terms
  const replacements = {
    'biometrics instruction letter': 'biometrics letter',
    'biometrics instructions': 'biometrics letter',
    'biometric instruction': 'biometrics letter',
    'biometric instructions': 'biometrics letter',
    'biometrics completed': 'biometrics done',
    'biometrics appointment': 'biometrics done',
    'biometrics finished': 'biometrics done',
    'medical exam completed': 'medical exam done',
    'medical examination completed': 'medical exam done',
    'medical exam finished': 'medical exam done',
    'medical examination finished': 'medical exam done',
    'medical passed': 'medical exam done',
    'additional docs requested': 'additional documents requested',
    'additional document requested': 'additional documents requested',
    'additional docs submitted': 'additional documents submitted',
    'additional document submitted': 'additional documents submitted',
    'acknowledgment of receipt': 'aor received',
    'acknowledgement of receipt': 'aor received',
    'aor': 'aor received',
    'invitation to apply': 'ita received',
    'ita': 'ita received',
    'confirmation of permanent residence': 'copr issued',
    'copr': 'copr issued'
  };
  
  // Apply replacements
  for (const [pattern, replacement] of Object.entries(replacements)) {
    normalized = normalized.replace(new RegExp(pattern, 'g'), replacement);
  }
  
  // Remove program type information in parentheses
  normalized = normalized.replace(/\s*\([^)]*\)\s*/g, ' ');
  
  // Remove extra spaces, special characters, and standardize spacing
  normalized = normalized
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
  
  return normalized;
}

/**
 * Compares two strings for similarity
 */
export function areSimilarStrings(str1: string, str2: string): boolean {
  return normalizeString(str1) === normalizeString(str2);
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