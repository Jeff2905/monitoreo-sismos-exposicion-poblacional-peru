# Desarrollo de una Aplicación Web Orientada a Servicios para el Monitoreo de Sismos y el Análisis de la Exposición Poblacional ante el Riesgo Sísmico en el Perú

## Curso
Arquitectura Orientada al Servicio

## Docente
Elmer Ely Medina Rodriguez

## Estudiantes
- Chucos Cardenas Javier — U19216721
- Cajahuanca Cruz, Brad Kenedy — U21310736
- Hinostroza Manrique, Sandro Sleither — U21221226

## Descripción del proyecto
El Perú es uno de los países con mayor actividad sísmica de Sudamérica. Este proyecto propone una aplicación web orientada a servicios que integra la información sísmica del Instituto Geofísico del Perú (IGP) con la información poblacional del Instituto Nacional de Estadística e Informática (INEI), con el fin de facilitar el análisis de la exposición de la población ante los eventos sísmicos registrados en el territorio peruano.

## Objetivo general
Diseñar e implementar una arquitectura orientada a servicios que permita integrar los datos sísmicos del IGP con la información poblacional del INEI, mediante el consumo de servicios web públicos, con el fin de mostrar de forma clara y unificada la actividad sísmica reciente y la población expuesta en cada zona geográfica.

## Arquitectura
El proyecto sigue un enfoque orientado a servicios (SOA) de tres capas:

- **Frontend:** React + Leaflet
- **Backend orquestador (API REST propia):** Node.js + Express
- **Servicios externos consumidos:**
  - IGP – ArcGIS REST (Feature Layer de sismos reportados) — JSON/geoJSON
  - INEI – Plataforma Nacional de Datos Abiertos (CKAN/DKAN Data API) — JSON

## Tecnologías
| Capa       | Tecnología                     |
|------------|---------------------------------|
| Frontend   | React, Leaflet, Axios           |
| Backend    | Node.js, Express, Axios, dotenv |
| Formato    | JSON / geoJSON                  |
| Protocolo  | HTTPS (REST)                    |

## Estructura del repositorio
```
├── backend/    # API REST orquestadora
│   └── src/
│       └── index.js
├── frontend/   # Interfaz web
│   └── src/
├── docs/       # Documentación y avances del curso
```

## Cómo ejecutar el proyecto

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
El servidor levanta por defecto en `http://localhost:4000`.

### Frontend
```bash
cd frontend
npm install
npm start
```

## Endpoints previstos del backend
| Método | Ruta                  | Descripción                                                   |
|--------|-----------------------|-----------------------------------------------------------------|
| GET    | `/api/sismos`         | Devuelve los sismos reportados recientes (proxy al IGP)         |
| GET    | `/api/poblacion`      | Devuelve datos de población por zona (proxy al INEI)            |
| GET    | `/api/exposicion`     | Devuelve sismos + población integrados por zona geográfica      |

## Estado del proyecto
🚧 En desarrollo — proyecto académico del curso de Arquitectura Orientada al Servicio.
