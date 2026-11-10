import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Misma normalización que el backend (sin tildes, mayúsculas)
const norm = (s) =>
  (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();

const fmtFecha = (f) => (typeof f === "number" ? new Date(f).toLocaleDateString("es-PE") : f ?? "N/D");
const fmtNum = (n) => (n == null ? "Sin dato" : Number(n).toLocaleString("es-PE"));

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [seleccion, setSeleccion] = useState(null); // departamento seleccionado

  useEffect(() => {
    axios
      .get(`${API_URL}/api/exposicion`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detalle || err.message));
  }, []);

  const zonas = useMemo(
    () =>
      [...(data?.zonas || [])].sort(
        (a, b) => b.sismos - a.sismos || (b.poblacion || 0) - (a.poblacion || 0)
      ),
    [data]
  );

  const sismosVisibles = useMemo(() => {
    const todos = data?.sismos || [];
    return seleccion ? todos.filter((s) => norm(s.departamento) === norm(seleccion)) : todos;
  }, [data, seleccion]);

  if (error) return <p style={{ padding: 20 }}>No se pudo cargar la información: {error}</p>;
  if (!data) return <p style={{ padding: 20 }}>Cargando datos del IGP e INEI…</p>;

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", margin: "10px 0" }}>
        Monitoreo de Sismos y Exposición Poblacional - Perú
      </h2>
      {data.desactualizado && (
        <p style={{ background: "#fff3cd", padding: 8, textAlign: "center", margin: 0 }}>
          Mostrando la última respuesta guardada: los servicios externos no respondieron.
        </p>
      )}

      <div style={{ display: "flex", height: "85vh" }}>
        <div style={{ flex: 1 }}>
          <MapContainer center={[-9.19, -75.0]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {sismosVisibles.map((s, i) =>
              s.lat && s.lon ? (
                <CircleMarker key={i} center={[s.lat, s.lon]} radius={(s.magnitud || 3) * 1.5}>
                  <Popup>
                    Magnitud: {s.magnitud ?? "N/D"} · Prof.: {s.profundidad ?? "N/D"} km
                    <br />
                    {s.departamento} · {fmtFecha(s.fecha)}
                    <br />
                    {s.referencia}
                  </Popup>
                </CircleMarker>
              ) : null
            )}
          </MapContainer>
        </div>

        <aside style={{ width: 380, overflowY: "auto", borderLeft: "1px solid #ccc", padding: 10 }}>
          <h3 style={{ marginTop: 0 }}>Exposición por departamento</h3>
          <p style={{ fontSize: 12, color: "#555" }}>
            Basado en los últimos {data.sismos.length} sismos reportados por el IGP. Haz clic en un
            departamento para filtrar el mapa.
          </p>
          {seleccion && (
            <button onClick={() => setSeleccion(null)} style={{ marginBottom: 8 }}>
              Ver todos
            </button>
          )}
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #333" }}>
                <th>Departamento</th>
                <th>Población</th>
                <th>Sismos</th>
                <th>Mag. máx.</th>
              </tr>
            </thead>
            <tbody>
              {zonas.map((z) => (
                <tr
                  key={z.departamento}
                  onClick={() => setSeleccion(norm(z.departamento) === norm(seleccion || "") ? null : z.departamento)}
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                    background: norm(z.departamento) === norm(seleccion || "") ? "#dbe9ff" : "transparent",
                  }}
                >
                  <td>{z.departamento}</td>
                  <td>{fmtNum(z.poblacion)}</td>
                  <td>{z.sismos}</td>
                  <td>{z.magnitudMax ? z.magnitudMax.toFixed(1) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 11, color: "#777" }}>
            Generado: {new Date(data.generado).toLocaleString("es-PE")}
          </p>
        </aside>
      </div>
    </div>
  );
}
