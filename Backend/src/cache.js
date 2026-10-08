const store = new Map();
export function getCache(key, { allowStale = false } = {}) {
  const e = store.get(key);
  if (!e) return null;
  if (allowStale || e.expires > Date.now()) return { value: e.value, stale: e.expires <= Date.now() };
  return null;
}
export function setCache(key, value, ttlSeconds) {
  store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}
