export function matchRoute(currentPath, routePath) {
  const routeParts = routePath.split("/").filter(Boolean);
  const currentParts = currentPath.split("/").filter(Boolean);

  if (routeParts.length !== currentParts.length) return null;

  const params = {};

  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(":")) {
      const paramName = routeParts[i].slice(1);
      params[paramName] = currentParts[i];
    } else if (routeParts[i] !== currentParts[i]) {
      return null;
    }
  }

  return params;
}
