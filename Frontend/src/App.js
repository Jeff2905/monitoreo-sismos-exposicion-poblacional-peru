import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function App() {
  const [sismos, setSismos] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/sismos`)
      .then((res) => setSismos(res.data || []))
      .catch((err) => console.error("Error al obtener sismos:", err.message));
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>
        Monitoreo de Sismos y Exposición Poblacional - Perú
      </h1>
      <MapContainer center={[-9.19, -75.0]} zoom={5} style={{ height: "85vh", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sismos.map((s, i) =>
          s.lat && s.lon ? (
            <CircleMarker key={i} center={[s.lat, s.lon]} radius={(s.magnitud || 3) * 1.5}>
              <Popup>
                Magnitud: {s.magnitud ?? "N/D"} · Prof.: {s.profundidad ?? "N/D"} km
                <br />
                {s.departamento} · {s.referencia}
              </Popup>
            </CircleMarker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
