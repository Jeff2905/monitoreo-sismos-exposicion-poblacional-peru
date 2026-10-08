import axios from "axios";
// GET con timeout y 1 reintento
export async function getJson(url, params) {
  const cfg = { params, timeout: Number(process.env.HTTP_TIMEOUT_MS || 8000) };
  try { return (await axios.get(url, cfg)).data; }
  catch { return (await axios.get(url, cfg)).data; }
}
