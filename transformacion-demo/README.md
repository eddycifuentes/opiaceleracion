# OPI 2026 - Transformación Demo

Prototipo interactivo de un sistema de gestión de iniciativas, tareas y sprints para OPI Aceleración 2026.

## 🚀 Características

- **Dashboard**: KPIs y gráficos interactivos
- **Iniciativas**: Gestión de proyectos con filtros y modales
- **Tareas**: Tabla de tareas con estados y prioridades
- **Sprints**: Planificación de sprints con detalles
- **Reportes**: Análisis ejecutivo y KPIs
- **Autenticación**: Simulada (demo)
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
│   ├── authStore.ts
│   ├── iniciativasStore.ts
│   ├── tareasStore.ts
│   └── sprintsStore.ts
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

Preparado para Vercel:

```bash
npm run build
# Subir carpeta 'dist' a Vercel
```

## 📝 Notas

- Este es un prototipo de demostración
- Los datos son mock y se resetean al recargar
- No hay backend real
- La autenticación es simulada
- Los botones de descarga (PDF/CSV) son mock

## 📞 Soporte

Para preguntas o sugerencias, contactar al equipo OPI Aceleración.
