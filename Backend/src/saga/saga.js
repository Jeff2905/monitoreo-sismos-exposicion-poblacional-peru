// Orquestador SAGA generico: ejecuta los pasos en orden y, si uno falla,
// compensa los pasos ya realizados en orden inverso.
export async function ejecutarSaga(nombre, pasos, ctx = {}) {
  const bitacora = [];
  const hechos = [];
  const log = (evento, paso, detalle) =>
    bitacora.push({ evento, paso, ...(detalle ? { detalle } : {}), hora: new Date().toISOString() });

  for (const paso of pasos) {
    try {
      await paso.accion(ctx);
      hechos.push(paso);
      log("ok", paso.nombre);
    } catch (e) {
      log("fallo", paso.nombre, e.message);
      for (const p of [...hechos].reverse()) {
        if (!p.compensar) { log("sin_compensacion", p.nombre); continue; }
        try { await p.compensar(ctx); log("compensado", p.nombre); }
        catch (ce) { log("compensacion_fallida", p.nombre, ce.message); }
      }
      return { ok: false, saga: nombre, error: e.message, pasoFallido: paso.nombre, bitacora };
    }
  }
  return { ok: true, saga: nombre, bitacora };
}
