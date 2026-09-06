import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ruta de salud del servicio
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend orquestador funcionando correctamente" });
});

// Proxy al servicio de sismos del IGP
app.get("/api/sismos", async (req, res) => {
  try {
    const response = await axios.get(process.env.IGP_SISMOS_URL, {
      params: {
        f: "json",
        where: "1=1",
        outFields: "*",
        resultRecordCount: 100,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(502).json({ error: "No se pudo obtener información del IGP", detalle: error.message });
  }
});

// Proxy al servicio de datos abiertos del INEI
app.get("/api/poblacion", async (req, res) => {
  try {
    const response = await axios.get(process.env.INEI_DATOS_ABIERTOS_URL, {
      params: {
        resource_id: req.query.resource_id,
        limit: req.query.limit || 100,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(502).json({ error: "No se pudo obtener información del INEI", detalle: error.message });
  }
});

// Endpoint propio: integra sismos + población por zona geográfica
app.get("/api/exposicion", async (req, res) => {
  try {
    // TODO: consumir /api/sismos y /api/poblacion, cruzar por departamento/región
    // y devolver la información combinada al frontend.
    res.json({
      mensaje: "Endpoint en construcción: aquí se integrará la información de sismos y población por zona.",
    });
  } catch (error) {
    res.status(500).json({ error: "Error al generar la exposición integrada", detalle: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend orquestador escuchando en http://localhost:${PORT}`);
});
