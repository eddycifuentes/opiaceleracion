# OPI Aceleración 🚀

Sistema de seguimiento de iniciativas de la Vicepresidencia de Innovación del Grupo Bolívar. Una plataforma colaborativa construida sobre Google Apps Script que permite gestionar proyectos, sprints, tareas y generar reportes en tiempo real.

## 📋 Descripción

OPI Aceleración es un sistema integral de gestión de iniciativas diseñado para facilitar la planificación, ejecución y seguimiento de proyectos de innovación. Proporciona visibilidad completa sobre el estado de cada iniciativa, permite la asignación de tareas por sprint y genera reportes automáticos con KPIs clave.

**Stack tecnológico:**
- **Backend:** Google Apps Script (JavaScript síncrono)
- **Base de datos:** Google Sheets
- **Almacenamiento:** Google Drive
- **Frontend:** SPA en HtmlService (HTML/CSS/JS puro + Tailwind CDN)

## ✨ Features

### Gestión de Proyectos
- Crear y editar iniciativas con información detallada (nombre, líder, empresa, etapa, estado, impacto)
- Seguimiento del progreso automático basado en sprints vigentes
- Historial completo de cambios de etapas con motivos y fechas
- Vista filtrada según rol del usuario (gestores ven solo sus iniciativas)

### Planificación de Sprints
- Crear sprints con fechas de inicio y fin
- Asignar tareas manualmente a cada sprint (sin automatización)
- Calcular progreso de proyecto desde el sprint actual
- Visualizar timeline de ejecución

### Gestión de Tareas
- Crear tareas asociadas a proyectos dentro de sprints
- Actualizar estado de tareas en tiempo real
- Asociar responsables y seguimiento de cumplimiento
- Alertas automáticas por correo para tareas atrasadas

### Reportes y Dashboards
- Snapshots de proyectos con estado completo
- KPIs en tiempo real: proyectos por etapa, progreso general, proyectos críticos
- Reportes de cumplimiento por sprint
- Exportación de datos a diferentes formatos

### Alertas y Notificaciones
- Alertas diarias de tareas atrasadas por correo
- Notificaciones a gestores y administradores
- CC configurables para cada tipo de alerta
- Triggers automáticos que se crean al iniciar el sistema

### Accesos Rápidos
- Guardar URLs frecuentes para fácil acceso
- Sincronización entre Sheets y navegador (localStorage)
- Categorización de accesos por tipo

## 🏗️ Arquitectura

### Estructura de Sheets

```
┌─────────────────────────────────────────┐
│    Google Sheet (Configuración)         │
├─────────────────────────────────────────┤
│ • Proyectos                             │
│   - ID, Nombre, Líder, Empresa, Etapa  │
│   - Estado, Impacto, Fechas, Metadata  │
│                                         │
│ • Tareas                                │
│   - ID, ID_Proyecto, Nombre, Estado    │
│   - ID_Sprint, Responsable, Fechas     │
│                                         │
│ • Sprints                               │
│   - ID, ID_Proyecto, Nombre            │
│   - Fecha_Inicio, Fecha_Fin, Estado    │
│                                         │
│ • Historial_Etapas                      │
│   - Registro de cambios de etapa        │
│   - Motivos, fechas, usuario            │
│                                         │
│ • Accesos_Rápidos                       │
│   - URLs frecuentes por usuario         │
└─────────────────────────────────────────┘
```

### Módulos de Código

| Módulo | Responsabilidad |
|--------|-----------------|
| **Codigo.js** | Entry point, rutas, autenticación |
| **Servicios.js** | Utilidades, generadores de ID, estructura de carpetas |
| **Alertas.js** | Sistema de alertas diarias, triggers, correos |
| **Reportes.js** | Generación de snapshots, KPIs, análisis |
| **Configuracion.js** | IDs de sheets, emails, constantes globales |

### Decisiones de Arquitectura

- **ADR-001:** Progreso calculado desde sprint vigente, no campo manual
- **ADR-002:** Gestores ven solo sus iniciativas; administradores ven todo
- **ADR-003:** Sin tareas automáticas por etapa. Gestores crean tareas libremente
- **ADR-004:** Accesos rápidos en Sheets con fallback a localStorage
- **ADR-005:** Historial_Etapas ya existe con 9 columnas confirmadas

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
- Cuenta Google (Gmail/Workspace)
- Acceso a Google Sheets y Google Drive
- Permisos de lectura/escritura en el proyecto

### Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/bolívar-innovation/opi-aceleración.git
   cd opi-aceleración
   ```

2. **Configurar Google Apps Script**
   ```bash
   # Instalar clasp (CLI para Google Apps Script)
   npm install -g @google/clasp
   
   # Autenticarse
   clasp login
   
   # Clonar el proyecto GAS
   clasp clone [SCRIPT_ID]
   ```

3. **Configurar constantes**
   - Editar `Configuracion.js` con los IDs de tu Spreadsheet
   - Actualizar IDs de hojas (Proyectos, Tareas, Sprints, etc.)
   - Configurar emails de administradores

4. **Desplegar**
   ```bash
   clasp push
   clasp deploy
   ```

5. **Inicializar estructura**
   - Acceder a la URL del deploy
   - Crear primer proyecto de prueba
   - Verificar que se creen carpetas en Drive

### Primer Uso

```javascript
// 1. Crear un proyecto
POST /crearProyecto
{
  "nombre": "Mi Iniciativa",
  "lider": "usuario@bolívar.com",
  "empresa": "Bolívar",
  "etapa": "Ideación",
  "impacto": "Alto"
}

// 2. Crear un sprint
POST /crearSprint
{
  "idProyecto": "PRY-001",
  "nombre": "Sprint 1",
  "fechaInicio": "2026-10-01",
  "fechaFin": "2026-10-14"
}

// 3. Crear tareas
POST /crearTarea
{
  "idProyecto": "PRY-001",
  "idSprint": "SPT-001",
  "nombre": "Validar concepto",
  "estado": "Pendiente"
}
```

## 🎯 Skills Aplicados

### Backend (Google Apps Script)
- ✅ Gestión de hojas de cálculo con SpreadsheetApp API
- ✅ Autenticación y control de acceso basado en rol
- ✅ Triggers automáticos para alertas diarias
- ✅ UrlFetchApp para integraciones externas
- ✅ LockService para operaciones de escritura críticas
- ✅ Manejo de errores robusto con Logger.log()

### Frontend (HtmlService)
- ✅ Interfaz responsiva con Tailwind CSS
- ✅ Comunicación asíncrona con google.script.run
- ✅ Gestión de estado cliente
- ✅ Validación de formularios
- ✅ Visualización de datos en tiempo real

### Patrones de Desarrollo
- ✅ Arquitectura modular sin require/import
- ✅ Generación de IDs únicos con timestamp + prefijo
- ✅ Caché en cliente para accesos rápidos
- ✅ Sincronización bidireccional Sheets ↔ Browser
- ✅ Manejo de concurrencia con locks

### Integración y Automatización
- ✅ Triggers programados (diarios, en cambios)
- ✅ Notificaciones por correo automáticas
- ✅ Creación automática de carpetas en Drive
- ✅ Snapshots de reportes en tiempo real

## 📦 Versión Demo (transformacion-demo)

El proyecto incluye una versión demo moderna con stack Vite + React + TypeScript:

```
transformacion-demo/
├── src/
│   ├── pages/         # Vistas principales
│   ├── components/    # Componentes reutilizables
│   ├── store/         # Zustand stores
│   └── data/          # Mock data
├── tests/             # Tests Jest
└── docs/              # Documentación adicional
```

**Para ejecutar la demo:**
```bash
cd transformacion-demo
npm install
npm run dev
```

## 🗺️ Roadmap

### Fase 1: Mejoras Inmediatas (Q4 2026)
- [ ] Eliminar llamada deprecada a `_crearTareasAutomaticasProyecto()`
- [ ] Refactorizar módulos para mejor testabilidad
- [ ] Documentación de APIs completa
- [ ] Dashboard mejorado con más visualizaciones

### Fase 2: Funcionalidades (Q1 2027)
- [ ] Integración con Google Calendar para sprints
- [ ] Notificaciones en tiempo real (Web Push)
- [ ] Exportación a Excel/PDF con formato
- [ ] Roles más granulares (Viewer, Editor, Admin)

### Fase 3: Escalabilidad (Q2 2027)
- [ ] Migración a Cloud Firestore (opcional)
- [ ] API REST completa
- [ ] Integración con Slack/Teams
- [ ] Machine Learning para predicción de riesgos

### Fase 4: Modernización (Q3 2027)
- [ ] Rewrite a React/Next.js con backend Node.js
- [ ] Testing E2E con Playwright
- [ ] CI/CD pipeline con GitHub Actions
- [ ] Monitoreo y observabilidad

## 📊 Convenciones del Proyecto

### Commits
```
feat:    Nueva funcionalidad
fix:     Corrección de bug
refactor: Cambio sin nueva funcionalidad
docs:    Documentación
chore:   Tareas de mantenimiento
```

### Código
- **Comentarios:** Español
- **JSDoc:** En cada función nueva
- **Manejo de errores:** try/catch + Logger.log()
- **IDs únicos:** generarIdUnico(prefijo, sheet)

### Sheets
- Filas con datos comienzan en 2 (fila 1 es header)
- Columnas sin espacios, nomenclatura snake_case
- Fechas en formato ISO (YYYY-MM-DD)
- Estado en campos controlados (lista desplegable)

## 🤝 Contribución

Para contribuir al proyecto:

1. **Crea una rama** desde `main`
   ```bash
   git checkout -b feat/tu-feature
   ```

2. **Realiza tus cambios** respetando las convenciones

3. **Haz push a tu rama**
   ```bash
   git push -u origin feat/tu-feature
   ```

4. **Abre un Pull Request** describiendo tus cambios

5. **Espera review** de un administrador del proyecto

## 📝 Licencia

Proyecto de la Vicepresidencia de Innovación del Grupo Bolívar. Uso interno.

## 📞 Soporte

Para preguntas o reportar issues:
- 📧 Email: innovacion@bolívar.com
- 💬 Slack: #opi-aceleración
- 🐛 GitHub Issues: [Crear issue](https://github.com/bolívar-innovation/opi-aceleración/issues)

---

**Última actualización:** Septiembre 2026
**Versión:** 1.0.0
**Estado:** En desarrollo
