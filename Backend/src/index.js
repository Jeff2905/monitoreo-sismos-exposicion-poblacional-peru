import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { fetchSismos } from "./services/igp.service.js";
import { fetchPoblacion } from "./services/inei.service.js";
import { getExposicion } from "./services/exposicion.service.js";

const app = express();
const origenes = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",");
app.use(cors({ origin: origenes }));
app.use(express.json());
const wrap = (fn) => async (req, res) => {
  try { res.json(await fn(req)); }
  catch (e) { res.status(503).json({ error: "Servicio externo no disponible", detalle: e.message }); }
};
app.get("/api/sismos", wrap((req) => fetchSismos(Math.min(Number(req.query.limit) || 100, 500))));
app.get("/api/sismos", wrap((req) => fetchSismos(Number(req.query.limit) || 100)));
app.get("/api/poblacion", wrap(() => fetchPoblacion()));
app.get("/api/exposicion", wrap(() => getExposicion()));
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend en http://localhost:${PORT}`));
