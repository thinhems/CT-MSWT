export function buildUrlParams(url: URL, params?: Record<string, any>): URL {
  if (!params) return url;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, item.toString()));
      } else {
        url.searchParams.append(key, value.toString());
      }
    }
  });

  return url;
}
