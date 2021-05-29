export function caseInsensitiveStringCompare(str1: string, str2: string) {
  return str1.localeCompare(str2, undefined, { sensitivity: 'base' });
}

export function caseInsensitiveStringEqual(str1: string, str2: string) {
  return caseInsensitiveStringCompare(str1, str2) === 0;
}
