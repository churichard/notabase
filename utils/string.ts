export function caseInsensitiveStringEqual(str1: string, str2: string) {
  return str1.localeCompare(str2, undefined, { sensitivity: 'base' }) === 0;
}
