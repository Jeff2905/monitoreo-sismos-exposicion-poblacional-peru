import fs from "fs";
import { getJson } from "../http.js";
export async function fetchPoblacion() {
  const { INEI_RESOURCE_ID, INEI_DATASTORE_URL, INEI_FIELD_DEPARTAMENTO: fd, INEI_FIELD_POBLACION: fp } = process.env;
  if (INEI_RESOURCE_ID) {
    const data = await getJson(INEI_DATASTORE_URL, { resource_id: INEI_RESOURCE_ID, limit: 1000 });
    return (data.result?.records || []).map((r) => ({ departamento: r[fd], poblacion: Number(r[fp]) }));
  }
  // Plan B: snapshot local
  return JSON.parse(fs.readFileSync(process.env.INEI_SNAPSHOT_PATH || "data/poblacion_departamental.json", "utf8"));
}
