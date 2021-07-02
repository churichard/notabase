// Adapted from https://stackoverflow.com/a/43467144
export const isUrl = (str: string) => {
  let url;

  try {
    url = new URL(str);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

export const queryParamToArray = (
  queryParam: string | string[] | undefined
) => {
  if (!queryParam) {
    return [];
  } else if (typeof queryParam === 'string') {
    return [queryParam];
  } else {
    return queryParam;
  }
};
