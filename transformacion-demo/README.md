# OPI 2026 - Transformación Demo

Prototipo interactivo de un sistema de gestión de iniciativas, tareas y sprints para OPI Aceleración 2026.

## 🚀 Características

- **Dashboard**: KPIs y gráficos interactivos
- **Iniciativas**: Gestión de proyectos con filtros y modales
- **Tareas**: Tabla de tareas con estados y prioridades
- **Sprints**: Planificación de sprints con detalles
- **Reportes**: Análisis ejecutivo y KPIs
- **Autenticación**: Simulada (demo). No hay validación real: acepta cualquier contraseña.
- **Estado Local**: Zustand para manejo de estado

## 🛠️ Stack

- React 18 + TypeScript
- Tailwind CSS
- Zustand (state management)
- React Router v6 (hash-based routing)
- Recharts (gráficos)
- Lucide React (iconos)
- Vite (build tool)

## 📦 Instalación

```bash
npm install
```

## 🏃 Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 🔐 Credenciales Demo

- **Email**: eddy.cifuentes@segurosbolivar.com
- **Password**: password

> El login es simulado. Cualquier contraseña es aceptada; las credenciales de arriba solo vienen precargadas por comodidad.

## 🏗️ Build

```bash
npm run build
```

## 📁 Estructura de Carpetas

```
src/
├── pages/              # Páginas principales
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── IniciativasPage.tsx
│   ├── TareasPage.tsx
│   ├── SprintsPage.tsx
│   └── ReportesPage.tsx
├── components/         # Componentes reutilizables
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Select.tsx
│   ├── KPICard.tsx
│   ├── IniciativaCard.tsx
│   ├── TareaRow.tsx
│   └── SprintCard.tsx
├── store/             # Zustand stores
│   ├── authStore.tsx
│   ├── iniciativasStore.tsx
│   ├── tareasStore.tsx
│   └── sprintsStore.tsx
├── data/              # Mock data
│   └── mockData.ts
├── App.tsx            # Componente principal
├── index.tsx          # Entry point
└── index.css          # Estilos globales
```

## 🎯 Funcionalidades

### Dashboard
- 4 KPI cards (Total, En Curso, Completadas, Cerradas)
- 3 gráficos (Pie, Bar, Line)
- Resumen ejecutivo

### Iniciativas
- Vista de tarjetas
- Filtros por nombre, empresa y etapa
- Modal de detalle
- Modal de edición
- Modal de cambio de etapa
- Búsqueda en tiempo real

### Tareas
- Tabla con columnas completas
- Filtros por proyecto, estado y asignado
- Modal de detalle
- Cambio de estado
- Búsqueda en tiempo real

### Sprints
- Grid de tarjetas
- Modal de detalle con tareas
- Modal de edición
- Stats de sprints

### Reportes
- Resumen ejecutivo
- Tabla de KPIs
- Top 3 iniciativas críticas
- Carga de trabajo por persona
- Botones de descarga (mock)

## 🔄 Interactividad

- Todos los filtros funcionan en tiempo real
- Modales abren/cierran correctamente
- Cambios se guardan en memoria
- Los datos persisten durante la sesión
- Navegación fluida entre secciones

## 📱 Responsive

- Diseño mobile-first
- Grid layouts adaptativos
- Componentes responsivos

## 🚀 Deployment

El despliegue es automático al hacer push a `main`:

- **Frontend**: Vercel (build `npm run build`, salida `dist/`).
- **Backend** (`backend/`, asistente IA): Render.

No hay pipeline propio de CI/CD en el repositorio (no existe `.github/`); la automatización la proveen Vercel y Render conectados al repo.

```bash
npm run build      # genera dist/ (lo que Vercel publica)
```

## 📝 Notas

- Este es un prototipo de demostración
- Los datos son mock y se resetean al recargar
- La autenticación es simulada (acepta cualquier contraseña)
- Los botones de descarga (PDF/CSV) son mock
- Existe un backend mínimo en `backend/` solo para el asistente IA (Gemini); el resto de la app funciona con datos mock en memoria

## 🏛️ Sistema original (Apps Script)

Esta demo es un prototipo frontend y **no** reimplementa el sistema de producción.
Las siguientes capacidades pertenecen al sistema original construido sobre Google
Apps Script + Google Sheets y **no forman parte de esta demo**:

- Alertas automáticas
- Control de acceso por roles (gestores vs. administradores)
- Generación automática de reportes PDF

En la demo, los equivalentes (descargas PDF/CSV, etc.) son simulados.

## 📞 Soporte

Para preguntas o sugerencias, contactar al equipo OPI Aceleración.
