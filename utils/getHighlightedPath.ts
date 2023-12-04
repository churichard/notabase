import { Path } from 'slate';

/**
 * Takes in a url with a hash parameter formatted like #1-2,3 (where 1 signifies the open note index,
 * and 2,3 signifies the path to be highlighted). Parses the url and
 * returns the open note index and the path to be highlighted as an object.
 */
const getHighlightedPath = (
  url: string
): { index: number; path: Path } | null => {
  const urlArr = url.split('#');
  if (urlArr.length <= 1) {
    return null;
  }

  const hash = urlArr[urlArr.length - 1];
  const [strIndex, ...strPath] = hash.split(/[-,]+/);

  const index = Number.parseInt(strIndex);
  const path = strPath.map((pathSegment) => Number.parseInt(pathSegment));
  if (
    Number.isNaN(index) ||
    path.length <= 0 ||
    path.some((segment) => Number.isNaN(segment))
  ) {
    return null;
  }

  return { index, path };
};

export default getHighlightedPath;
