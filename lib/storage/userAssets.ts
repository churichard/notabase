const SIGNED_USER_ASSET_PATH = '/storage/v1/object/sign/user-assets/';

export const getUserAssetPaths = (content: unknown, userId: string) => {
  const paths = new Set<string>();

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!value || typeof value !== 'object') {
      return;
    }

    const node = value as Record<string, unknown>;
    if (node.type === 'image' && typeof node.url === 'string') {
      const path = getUserAssetPath(node.url, userId);
      if (path) {
        paths.add(path);
      }
    }

    if (Array.isArray(node.children)) {
      visit(node.children);
    }
  };

  visit(content);
  return [...paths];
};

const getUserAssetPath = (url: string, userId: string) => {
  try {
    const pathname = new URL(url).pathname;
    const markerIndex = pathname.indexOf(SIGNED_USER_ASSET_PATH);
    if (markerIndex === -1) {
      return null;
    }

    const encodedPath = pathname.slice(
      markerIndex + SIGNED_USER_ASSET_PATH.length
    );
    const path = decodeURIComponent(encodedPath);
    return path.startsWith(`${userId}/`) ? path : null;
  } catch {
    return null;
  }
};
