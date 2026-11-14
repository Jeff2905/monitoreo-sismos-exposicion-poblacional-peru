
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./ReportesSaga.css";

const NOMBRES = {
  obtener_exposicion: "Obtener exposición (IGP + INEI)",
  guardar_reporte: "Guardar reporte",
  notificar_equipo: "Notificar al equipo (simulado)",
  publicar_reporte: "Publicar reporte",
};

const EVENTOS = {
  ok: { titulo: "Completado", estilo: "exito" },
  fallo: { titulo: "Falló", estilo: "error" },
  compensado: { titulo: "Compensación ejecutada", estilo: "compensado" },
  compensacion_fallida: { titulo: "Falló la compensación", estilo: "error" },
  sin_compensacion: { titulo: "Sin compensación", estilo: "neutro" },
};

const fecha = (valor) =>
  valor ? new Date(valor).toLocaleString("es-PE") : "—";

export default function ReportesSaga({ apiUrl }) {
  const [fallar, setFallar] = useState("");
  const [ejecutando, setEjecutando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [errorListado, setErrorListado] = useState("");

  const cargarReportes = useCallback(async () => {
    setCargando(true);
    setErrorListado("");

    try {
      const respuesta = await axios.get(`${apiUrl}/api/reportes`);

      if (!Array.isArray(respuesta.data)) {
        throw new Error("Respuesta de reportes inesperada");
      }

      setReportes(respuesta.data);
    } catch (error) {
      setErrorListado(
        error.response?.data?.error ||
        error.message ||
        "No fue posible obtener los reportes"
      );
    } finally {
      setCargando(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    cargarReportes();
  }, [cargarReportes]);

  const ejecutar = async () => {
    if (ejecutando) return;

    setEjecutando(true);
    setResultado(null);

    try {
      const url = `${apiUrl}/api/reportes${
        fallar ? `?fallar=${encodeURIComponent(fallar)}` : ""
      }`;

      const respuesta = await axios.post(url, {});
      setResultado(respuesta.data);
    } catch (error) {
      /* El backend responde HTTP 500 si falla la SAGA.
        La respuesta incluye la bitácora de compensaciones.*/
      if (error.response?.data?.bitacora) {
        setResultado(error.response.data);
      } else {
        setResultado({
          ok: false,
          error:
            error.response?.data?.error ||
            error.message ||
            "Error de conexión",
          bitacora: [],
        });
      }
    } finally {
      setEjecutando(false);
      await cargarReportes();
    }
  };

  return (
    <section className="saga-panel" aria-labelledby="saga-titulo">
      <div className="saga-encabezado">
        <div>
          <span className="saga-etiqueta">
            PATRÓN SAGA · ORQUESTACIÓN
          </span>

          <h2 id="saga-titulo">
            Generación de reportes sísmicos
          </h2>

          <p>
            El backend obtiene la exposición, guarda el reporte,
            simula una notificación y lo publica. Si falla un paso,
            compensa los anteriores.
          </p>
        </div>

        <span className="saga-indicador">
          Backend SAGA
        </span>
      </div>

      <div className="saga-columnas">
        {/* PANEL PARA EJECUTAR SAGA */}
        <div className="saga-tarjeta">
          <h3>Ejecutar una SAGA</h3>

          <label htmlFor="saga-fallo">
            Prueba de funcionamiento
          </label>

          <select
            id="saga-fallo"
            value={fallar}
            onChange={(e) => setFallar(e.target.value)}
            disabled={ejecutando}
          >
            <option value="">
              Ejecución normal (sin fallos)
            </option>

            <option value="guardar">
              Simular error al guardar
            </option>

            <option value="notificar">
              Simular error al notificar
            </option>

            <option value="publicar">
              Simular error al publicar (muestra compensaciones)
            </option>
          </select>

          <button
            className="saga-boton"
            type="button"
            onClick={ejecutar}
            disabled={ejecutando}
          >
            {ejecutando
              ? "Ejecutando SAGA…"
              : "Generar reporte"}
          </button>

          <p className="saga-ayuda">
            Para demostrar las compensaciones al profesor,
            selecciona <strong>Simular error al publicar</strong>.
          </p>

          <div aria-live="polite">
            {resultado && (
              <div
                className={`saga-resultado ${
                  resultado.ok
                    ? "saga-resultado-ok"
                    : "saga-resultado-error"
                }`}
              >
                <strong>
                  {resultado.ok
                    ? "SAGA completada correctamente"
                    : "SAGA fallida"}
                </strong>

                {resultado.error && (
                  <p>{resultado.error}</p>
                )}

                {resultado.pasoFallido && (
                  <p>
                    Paso fallido:{" "}
                    {NOMBRES[resultado.pasoFallido] ||
                      resultado.pasoFallido}
                  </p>
                )}

                {resultado.reporte && (
                  <p>
                    Reporte:{" "}
                    <strong>{resultado.reporte.id}</strong>
                    {" · "}
                    Estado: {resultado.reporte.estado}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BITÁCORA DE EJECUCIÓN */}
        <div className="saga-tarjeta">
          <h3>Bitácora de ejecución</h3>

          {!resultado && (
            <p className="saga-vacio">
              Ejecuta una SAGA para ver cada paso
              y las compensaciones.
            </p>
          )}

          {resultado &&
            resultado.bitacora?.length === 0 && (
              <p className="saga-vacio">
                No se recibió una bitácora.
                Comprueba la conexión con el backend.
              </p>
            )}

          {resultado?.bitacora?.length > 0 && (
            <ol className="saga-bitacora">
              {resultado.bitacora.map((item, indice) => {
                const info = EVENTOS[item.evento] || {
                  titulo: item.evento,
                  estilo: "neutro",
                };

                return (
                  <li
                    key={`${indice}-${item.paso}`}
                    className={`saga-evento saga-evento-${info.estilo}`}
                  >
                    <span className="saga-paso">
                      {NOMBRES[item.paso] || item.paso}
                    </span>

                    <span className="saga-estado">
                      {info.titulo}
                    </span>

                    {item.detalle && (
                      <small>{item.detalle}</small>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>

      {/* HISTORIAL DE REPORTES */}
      <div className="saga-tarjeta saga-historial">
        <div className="saga-historial-titulo">
          <div>
            <h3>
              Reportes registrados ({reportes.length})
            </h3>

            <p>
              Se guardan en memoria en el backend y se pierden
              cuando se reinicia el servidor.
            </p>
          </div>

          <button
            type="button"
            className="saga-boton-secundario"
            onClick={cargarReportes}
            disabled={cargando}
          >
            {cargando ? "Actualizando…" : "Actualizar"}
          </button>
        </div>

        {errorListado && (
          <p className="saga-error-listado" role="alert">
            No se pudo cargar el historial: {errorListado}
          </p>
        )}

        {!errorListado && reportes.length === 0 && (
          <p className="saga-vacio">
            Aún no hay reportes publicados.
          </p>
        )}

        {reportes.length > 0 && (
          <div className="saga-tabla-contenedor">
            <table className="saga-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Estado</th>
                  <th>Sismos</th>
                  <th>Creado</th>
                </tr>
              </thead>

              <tbody>
                {[...reportes].reverse().map((rep) => (
                  <tr key={rep.id}>
                    <td>{rep.id}</td>

                    <td>
                      <span className="saga-chip">
                        {rep.estado}
                      </span>
                    </td>

                    <td>{rep.totalSismos ?? "—"}</td>
                    <td>{fecha(rep.creado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
