import express from "express";
import { generarReporte, listarReportes } from "./saga/reporte.saga.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { fetchSismos } from "./services/igp.service.js";
import { fetchPoblacion } from "./services/inei.service.js";
import { getExposicion } from "./services/exposicion.service.js";

const app = express();
app.use(cors());
app.use(express.json());
const wrap = (fn) => async (req, res) => {
  try { res.json(await fn(req)); }
  catch (e) { res.status(503).json({ error: "Servicio externo no disponible", detalle: e.message }); }
};
app.get("/", (req, res) => res.json({ status: "ok" }));
app.get("/api/sismos", wrap((req) => fetchSismos(Number(req.query.limit) || 100)));
app.get("/api/poblacion", wrap(() => fetchPoblacion()));
app.get("/api/exposicion", wrap(() => getExposicion()));
app.post("/api/reportes", async (req, res) => {
  try {
    const r = await generarReporte({ fallar: req.query.fallar });
    res.status(r.ok ? 201 : 500).json(r);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
app.get("/api/reportes", (req, res) => res.json(listarReportes()));
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend en http://localhost:${PORT}`));
