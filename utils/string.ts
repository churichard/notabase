export function caseInsensitiveStringEqual(str1: string, str2: string) {
  if (str1 && !str2) {
    return false;
  } else if (!str1 && str2) {
    return false;
  } else {
    return str1.localeCompare(str2, undefined, { sensitivity: 'base' }) === 0;
  }
}
