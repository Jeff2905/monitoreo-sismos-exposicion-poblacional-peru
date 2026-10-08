import { getJson } from "../http.js";
export async function fetchSismos(limit = 100) {
  const data = await getJson(process.env.IGP_SISMOS_URL, {
    where: "1=1", outFields: "*", orderByFields: "fecha DESC",
    resultRecordCount: limit, f: "geojson",
  });
  return (data.features || []).map((f) => ({
    fecha: f.properties.fecha, hora: f.properties.hora,
    magnitud: f.properties.magnitud, profundidad: f.properties.prof,
    referencia: f.properties.ref, departamento: f.properties.departamento,
    lat: f.geometry?.coordinates?.[1], lon: f.geometry?.coordinates?.[0],
  }));
}
