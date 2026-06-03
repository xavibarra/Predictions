# World Cup 2026 Predictions App

App de predicciones deportivas para el Mundial de fútbol 2026. Los usuarios se registran, hacen predicciones sobre los partidos y compiten en una clasificación global por puntos.

## Stack

- **React 19** — UI y lógica de cliente
- **Vite 8** — bundler y servidor de desarrollo
- **Supabase** — backend, base de datos y autenticación
- **React Router v6** — sistema de rutas

## Arrancar el proyecto

> Este proyecto usa **pnpm**. No usar npm (falla en Windows al ejecutar scripts de Vite).

```bash
pnpm dev       # servidor de desarrollo en localhost:5173
pnpm build     # build de producción
pnpm preview   # previsualizar el build
```

## Flujo de la app

1. El usuario se registra o inicia sesión
2. **Antes del mundial:** predice toda la fase de grupos — resultados de partidos, ganadores de grupo, campeón, etc.
3. **Durante el torneo:** se abren ventanas de predicción por ronda (octavos, cuartos, semis, final) que se cierran antes de que empiece cada ronda
4. Clasificación global con puntos según aciertos

## Rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home | Bienvenida y acceso al login/registro |
| `/login` | Login | Formulario de inicio de sesión |
| `/register` | Register | Formulario de registro |
| `/predictions` | Predictions | Formularios de predicción por ronda |
| `/leaderboard` | Leaderboard | Clasificación global de jugadores |

## Estructura de carpetas

```
src/
├── pages/          # Una página por ruta
├── components/
│   └── ui/         # Componentes reutilizables (Button, Input, Card...)
├── features/
│   ├── auth/       # Lógica de login/registro
│   └── predictions/# Lógica de predicciones
├── hooks/          # Custom hooks de React
├── lib/
│   └── supabaseClient.js  # Cliente de Supabase
└── main.jsx
```

## Variables de entorno

Crear un archivo `.env.local` en la raíz con:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

## Pendiente de decidir

- Sistema de puntuación exacto (puntos por acertar ganador, resultado exacto, goleador, etc.)
- Si las ventanas de predicción las abre un admin manualmente o son automáticas
- Si la app es pública o para grupo cerrado
