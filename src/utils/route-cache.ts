const routeCacheVersionMap = new Map<string, number>();

function normalizeRouteName(routeName?: string | symbol | null) {
  if (routeName === undefined || routeName === null) {
    return '';
  }

  return String(routeName);
}

export function getRouteCacheVersion(routeName?: string | symbol | null) {
  const normalized = normalizeRouteName(routeName);
  if (!normalized) {
    return 0;
  }

  return routeCacheVersionMap.get(normalized) ?? 0;
}

export function bumpRouteCacheVersion(routeName?: string | symbol | null) {
  const normalized = normalizeRouteName(routeName);
  if (!normalized) {
    return 0;
  }

  const nextVersion = getRouteCacheVersion(normalized) + 1;
  routeCacheVersionMap.set(normalized, nextVersion);
  return nextVersion;
}

export function clearRouteCacheVersions(routeNames: Array<string | symbol | null | undefined>) {
  routeNames.forEach((routeName) => {
    bumpRouteCacheVersion(routeName);
  });
}
