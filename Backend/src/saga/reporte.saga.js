import { ejecutarSaga } from "./saga.js";
import { getExposicion } from "../services/exposicion.service.js";

// Almacen en memoria (se pierde al reiniciar el servidor). Tope para evitar abuso.
const MAX_REPORTES = 50;
const reportes = new Map();
const avisos = new Set(); // notificaciones simuladas

export const listarReportes = () => [...reportes.values()];

const CLAVES = ["guardar", "notificar", "publicar"];

// Saga orquestada: generar y publicar un reporte de exposicion sismica.
// "fallar" permite simular una falla en un paso ("guardar", "notificar" o "publicar") para demostrar las compensaciones.
export async function generarReporte({ fallar } = {}) {
  const simular = CLAVES.includes(fallar) ? fallar : null;
  const fallaSimulada = (clave) => {
    if (simular === clave) throw new Error(`falla simulada en el paso "${clave}"`);
  };

  const pasos = [
    {
      nombre: "obtener_exposicion", // compone IGP + INEI (solo lectura, sin compensacion)
      accion: async (c) => { c.exposicion = await getExposicion(); },
    },
    {
      nombre: "guardar_reporte",
      accion: async (c) => {
        fallaSimulada("guardar");
        if (reportes.size >= MAX_REPORTES) throw new Error("almacen de reportes lleno");
        c.id = `rep-${Date.now()}`;
        reportes.set(c.id, {
          id: c.id,
          estado: "borrador",
          creado: new Date().toISOString(),
          totalSismos: c.exposicion.sismos.length,
          zonas: c.exposicion.zonas,
        });
      },
      compensar: async (c) => { reportes.delete(c.id); },
    },
    {
      nombre: "notificar_equipo",
      accion: async (c) => { fallaSimulada("notificar"); c.aviso = `aviso-${c.id}`; avisos.add(c.aviso); },
      compensar: async (c) => { avisos.delete(c.aviso); },
    },
    {
      nombre: "publicar_reporte",
      accion: async (c) => { fallaSimulada("publicar"); reportes.get(c.id).estado = "publicado"; },
    },
  ];

  const ctx = {};
  const r = await ejecutarSaga("generar_reporte_exposicion", pasos, ctx);
  return r.ok ? { ...r, reporte: reportes.get(ctx.id) } : r;
}
