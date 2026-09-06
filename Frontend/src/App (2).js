import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

function App() {
  const [sismos, setSismos] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/sismos`)
      .then((res) => setSismos(res.data?.features || []))
      .catch((err) => console.error("Error al obtener sismos:", err.message));
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <h1 style={{ textAlign: "center" }}>
        Monitoreo de Sismos y Exposición Poblacional - Perú
      </h1>
      <MapContainer
        center={[-9.19, -75.0]}
        zoom={5}
        style={{ height: "85vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sismos.map((sismo, i) => {
          const lat = sismo?.geometry?.y;
          const lon = sismo?.geometry?.x;
          if (!lat || !lon) return null;
          return (
            <Marker key={i} position={[lat, lon]}>
              <Popup>
                Magnitud: {sismo?.attributes?.magnitud ?? "N/D"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default App;
