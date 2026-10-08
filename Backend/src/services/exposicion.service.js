import { fetchSismos } from "./igp.service.js";
import { fetchPoblacion } from "./inei.service.js";
import { getCache, setCache } from "../cache.js";
const norm = (s) => (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
export async function getExposicion() {
  const key = "exposicion";
  const fresh = getCache(key);
  if (fresh) return { ...fresh.value, desactualizado: false };
  try {
    const [sismos, poblacion] = await Promise.all([fetchSismos(), fetchPoblacion()]);
    const zonas = {};
    for (const p of poblacion) zonas[norm(p.departamento)] = { departamento: p.departamento, poblacion: p.poblacion, sismos: 0, magnitudMax: null };
    for (const s of sismos) {
      const z = (zonas[norm(s.departamento)] ??= { departamento: s.departamento, poblacion: null, sismos: 0, magnitudMax: null });
      z.sismos += 1;
      z.magnitudMax = Math.max(z.magnitudMax ?? 0, s.magnitud ?? 0);
    }
    const value = { generado: new Date().toISOString(), zonas: Object.values(zonas), sismos };
    setCache(key, value, Number(process.env.CACHE_TTL_SECONDS || 300));
    return { ...value, desactualizado: false };
  } catch (e) {
    const stale = getCache(key, { allowStale: true });
    if (stale) return { ...stale.value, desactualizado: true };
    throw e;
  }
}
