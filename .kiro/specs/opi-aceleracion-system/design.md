# Design Document — OPI Aceleración System

## Overview

Sistema de seguimiento de iniciativas de aceleración para la Vicepresidencia de Innovación del Grupo Bolívar. Arquitectura monolítica sobre Google Apps Script (servidor síncrono) con Google Sheets como base de datos, Google Drive para almacenamiento documental, y frontend SPA servido mediante HtmlService.

Este documento describe la arquitectura existente (Requirements 1–13) y el diseño de las funcionalidades planificadas (Requirements 14–16).

---

## Architecture

### Patrón General

```
┌──────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                       │
│  Index.html + JavaScript.html + Estilos.html + Inicio.html│
│  Tailwind CDN · Chart.js · Bootstrap Icons · html2pdf.js  │
└─────────────────────┬────────────────────────────────────┘
                      │ google.script.run (async callbacks)
                      ▼
┌──────────────────────────────────────────────────────────┐
│              SERVIDOR (Google Apps Script)                 │
│  ┌────────────┐ ┌───────────────┐ ┌──────────────┐       │
│  │ Codigo.js  │ │Configuracion.js│ │ Servicios.js │       │
│  │ (CRUD +    │ │(CONFIG global) │ │ (Utilities)  │       │
│  │  KPIs +    │ └───────────────┘ └──────────────┘       │
│  │  Sprints)  │ ┌───────────────┐ ┌──────────────┐       │
│  └────────────┘ │  Alertas.js   │ │ Reportes.js  │       │
│                 │ (Daily trigger)│ │ (Snapshot +  │       │
│                 └───────────────┘ │  CSV export)  │       │
│                                   └──────────────┘       │
└─────────────────────┬────────────────────────────────────┘
                      │ SpreadsheetApp / DriveApp / MailApp
                      ▼
┌──────────────────────────────────────────────────────────┐
│              DATOS (Google Sheets + Drive)                 │
│  Proyectos · Tareas · Sprints · Historial_Etapas         │
│  Configuración · Accesos_Rapidos (planned)               │
│  Google Drive folders (estructura documental)             │
└──────────────────────────────────────────────────────────┘
```


### Restricciones Técnicas

| Restricción | Detalle |
|---|---|
| Runtime | Google Apps Script V8 — síncrono, sin async/await |
| Módulos | Sin import/require — todas las funciones son globales |
| HTTP | UrlFetchApp (no fetch) |
| Logging | Logger.log() (no console.log) |
| Concurrencia | LockService.getScriptLock() para escrituras críticas |
| Frontend | HTML/CSS/JS puro + Tailwind CDN + Chart.js + html2pdf.js |
| Comunicación | google.script.run con callbacks withSuccessHandler/withFailureHandler |
| Base de datos | Google Sheets (SpreadsheetApp) — sin SQL ni transacciones |
| Almacenamiento | Google Drive (DriveApp) para estructura documental |
| Email | MailApp / GmailApp para alertas y newsletters |
| Triggers | ScriptApp.newTrigger() — time-based (diario, semanal) |

---

## Components and Interfaces

### Servidor (archivos .js)

#### Codigo.js — Módulo Principal
- `doGet(e)` — Entry point, sirve la SPA
- `include(filename)` — Template inclusion
- `obtenerInfoUsuario()` — Email + inicial del usuario
- **Proyectos:** `obtenerProyectos()`, `crearProyecto()`, `actualizarProyecto()`, `eliminarProyecto()`
- **Etapas:** `cambiarEtapaProyecto()`, `cambiarEstadoGestionProyecto()`
- **Tareas:** `obtenerTareas()`, `crearTarea()`, `actualizarTarea()`, `cambiarEstadoTareaConComentario()`
- **Sprints:** `crearSprint()`, `obtenerSprints()`, `eliminarSprint()`
- **Dashboard:** `obtenerEstadisticas()`, `obtenerEstadisticasGlobales()`
- **Análisis:** `obtenerProyectosConAnalisis()`, `calcularProgresoEsperado()`
- **Auto-tasks:** `_crearTareasAutomaticasProyecto()`, `_actualizarFechasTareasEtapa()`
- **Historial:** `_registrarHistorialEtapa()`, `_asegurarHistorialEtapas()`

#### Configuracion.js — Configuración Global
- `CONFIG` object: IDs de spreadsheet/drive, nombres de hojas, listas de valores permitidos, prefijos de ID, URL webapp, catálogo TAREAS_POR_ETAPA

#### Servicios.js — Utilidades
- `generarIdUnico(prefijo, sheet)` — IDs con formato `{PREFIJO}-{yyyyMMdd}-{NNN}`
- `obtenerEmailUsuario()` — Email del usuario activo
- `obtenerAdministradores()` — Lista de admins desde hoja Configuración
- `esAdministrador()` — Verifica rol del usuario actual
- `crearEstructuraCarpetasProyecto(nombre)` — Crea folder + subfolders en Drive
- `obtenerConfiguracion()` — Lee correos y roles

#### Alertas.js — Alertas Diarias
- `revisarTareasYEnviarAlertas()` — Función del trigger diario (8:00 AM)
- `enviarCorreoAlerta(tarea, proyecto, correosCC)` — Genera y envía HTML email
- `obtenerUrlWebApp()` — Resuelve URL para deep links
- `crearTriggerDiario()` — Instala el trigger

#### Reportes.js — Generación de Reportes
- `generarReporteSnapshot(filtros)` — Snapshot ejecutivo completo
- `generarReporteExportacion(filtros)` — Exportación CSV
- `construirKPIs()`, `construirMetadata()`, `construirDetalleProyectos()`
- `construirResumenSprints()`, `construirCargaPorPersona()`
- `construirDistribucionEmpresas()`, `identificarProyectosCriticos()`
- `generarObservacionesAutomaticas()`, `obtenerEstadosTareasOpciones()`

### Cliente (archivos .html)

#### Index.html — Shell Principal
- Barra de navegación con 5 vistas: Dashboard, Iniciativas, Tareas, Reportes, Inicio
- Contenedores de vistas (SPA con display toggle)
- Modales: crear/editar iniciativa, cambiar etapa, cambiar estado gestión, crear tarea, crear sprint

#### JavaScript.html — Lógica Cliente
- Router SPA (hash-based + URL params para deep links)
- Funciones de renderizado por vista (Dashboard, Iniciativas, Tareas, Reportes, Inicio)
- Integración Chart.js para 6 gráficos del dashboard
- Filtros interactivos con click en gráficos
- Llamadas a servidor vía `google.script.run`

#### Estilos.html — CSS Personalizado
- Estilos complementarios a Tailwind para componentes Kanban, cards, badges

#### Inicio.html — Módulo Accesos Rápidos
- Grid de cards con CRUD local (localStorage actual, migración a Sheets planificada)
- Filtros por categoría y búsqueda de texto
- Export/import JSON

---

## Data Models

### Hoja: Proyectos

| Columna | Tipo | Descripción |
|---|---|---|
| ID_Proyecto | String | PK — formato `INI-yyyyMMdd-NNN` |
| Nombre | String | Nombre de la iniciativa |
| Descripcion | String | Descripción libre |
| Lider | String | Nombre del líder de negocio |
| Empresa | Enum | Davivienda / Seguros Bolívar / Constructora Bolívar |
| Startup | String | Nombre del aliado/startup |
| Fecha_Inicio | Date | Fecha inicio etapa actual |
| Fecha_Fin | Date | Fecha fin etapa actual |
| Etapa | Enum | Etapa OPI 2026 (1-6) |
| Progreso | Number | Porcentaje calculado del sprint vigente |
| Estado_Gestion | Enum | Activo / En Pausa / Finalizado |
| Impacto | Enum | Ingresos / Eficiencia / Experiencia |
| Aliado_URL | String | URL del aliado externo |
| Propietario | String | Email del gestor creador |
| Carpeta_URL | String | URL de la carpeta en Drive |
| Comentarios | String | Historial de cambios concatenado |

### Hoja: Tareas

| Columna | Tipo | Descripción |
|---|---|---|
| ID_Tarea | String | PK — formato `TSK-yyyyMMdd-NNN` |
| ID_Proyecto | String | FK → Proyectos |
| Nombre_Tarea | String | Nombre descriptivo |
| Asignado_A | String | Email del responsable |
| Fecha_Entrega | Date | Derivada de Sprint.Fecha_Fin |
| Estado_Tarea | Enum | Pendiente / En Proceso / Completada |
| Prioridad | Enum | Alta / Media / Baja |
| Descripcion | String | Detalle de la tarea |
| Comentarios | String | Historial de comentarios |
| Fecha_Completada | Date | Fecha de marcado como Completada |
| Estado_Proyecto_Asignado | String | Etapa del proyecto al momento de crear |
| ID_Sprint | String | FK → Sprints |
| Nombre_Sprint | String | Nombre desnormalizado |
| Fecha_Inicio_Sprint | Date | Fecha inicio desnormalizada |
| Fecha_Fin_Sprint | Date | Fecha fin desnormalizada |

### Hoja: Sprints

| Columna | Tipo | Descripción |
|---|---|---|
| ID_Sprint | String | PK — formato `SPR-yyyyMMdd-NNN` |
| ID_Proyecto | String | FK → Proyectos |
| Nombre | String | Nombre del sprint |
| Descripcion | String | Descripción libre |
| Fecha_Inicio | Date | Inicio del sprint |
| Fecha_Fin | Date | Fin del sprint |

### Hoja: Historial_Etapas

| Columna | Tipo | Descripción |
|---|---|---|
| ID_Proyecto | String | FK → Proyectos |
| Etapa_Anterior | String | Etapa antes del cambio |
| Etapa_Nueva | String | Etapa después del cambio |
| Motivo | String | Justificación (min 5 chars) |
| Fecha_Inicio | Date | Nueva fecha inicio |
| Fecha_Fin | Date | Nueva fecha fin |
| Fecha_Cambio | Timestamp | Momento del cambio |
| Usuario | String | Email de quien ejecutó |

### Hoja: Configuración

| Columna | Tipo | Descripción |
|---|---|---|
| Email | String | Correo del usuario |
| Rol | String | Admin / Gestor |

### Hoja: Accesos_Rapidos [PLANNED — Req 15]

| Columna | Tipo | Descripción |
|---|---|---|
| ID_Acceso | String | PK — formato `ACC-yyyyMMdd-NNN` |
| Email_Usuario | String | Email del propietario del acceso |
| Titulo | String | Título del enlace |
| URL | String | URL destino |
| Descripcion | String | Descripción del enlace |
| Categoria | String | Categoría libre |
| Icono | String | Clase de Bootstrap Icon |
| Color | String | Color hex o clase Tailwind |

---

### Interfaces

#### Server → Client (funciones globales expuestas a google.script.run)

```javascript
// Proyectos
function obtenerProyectos() → Array<Proyecto>
function crearProyecto(proyecto) → {success, id, carpetaUrl, mensaje}
function actualizarProyecto(datos) → {success, mensaje}
function eliminarProyecto(idProyecto) → {success, mensaje}
function obtenerProyectosConAnalisis() → Array<ProyectoConAnalisis>
```

```javascript
// Etapas y Estado de Gestión
function cambiarEtapaProyecto(datos) → {success, mensaje}
function cambiarEstadoGestionProyecto(datos) → {success, mensaje}

// Tareas
function obtenerTareas() → Array<Tarea>
function crearTarea(tarea) → {success, id, mensaje}
function actualizarTarea(datos) → {success, mensaje}
function cambiarEstadoTareaConComentario(datos) → {success, mensaje}

// Sprints
function crearSprint(datos) → {success, id, mensaje}
function obtenerSprints(idProyecto) → Array<Sprint>
function eliminarSprint(idSprint) → {success, mensaje}

// Dashboard
function obtenerEstadisticas() → EstadisticasObj
function obtenerEstadisticasGlobales() → EstadisticasObj

// Reportes
function generarReporteSnapshot(filtros) → ReporteSnapshot
function generarReporteExportacion(filtros) → Array<Array>

// Configuración y usuario
function obtenerInfoUsuario() → {email, inicial}
function esAdministrador() → boolean
function obtenerConfiguracion() → {correos, roles}
function obtenerEstadosTareasOpciones() → Array<{valor, etiqueta}>
```

#### Client → Server (patrón de llamada)

```javascript
// Patrón estándar — NO usar async/await
google.script.run
  .withSuccessHandler(function(resultado) {
    // Procesar respuesta
  })
  .withFailureHandler(function(error) {
    // Mostrar error al usuario
  })
  .nombreFuncionServidor(parametros);
```

---

## Planned Features — Design

### Requirement 14: Resumen Ejecutivo Periódico

#### Archivo afectado: Alertas.js (nueva función) + Configuracion.js (nueva constante)

**Nuevas constantes en CONFIG:**
```javascript
// En Configuracion.js
ASUNTO_RESUMEN: '[VP de Innovación] Resumen Ejecutivo Semanal',
DIA_RESUMEN: 1,    // 1=lunes (ScriptApp.WeekDay.MONDAY)
HORA_RESUMEN: 7    // 7:00 AM
```

**Nuevas funciones globales en Alertas.js:**
```javascript
/**
 * Genera y envía el resumen ejecutivo semanal a todos los administradores.
 * Trigger semanal configurable.
 */
function enviarResumenEjecutivoSemanal() {
  // 1. Obtener todos los proyectos y tareas (sin filtro de usuario)
  // 2. Calcular KPIs: total, activos, tareas vencidas, progreso global
  // 3. Identificar iniciativas que requieren atención
  // 4. Construir HTML newsletter con bullet points
  // 5. Obtener lista de administradores desde Configuracion_Sheet
  // 6. Enviar email a cada administrador
}
```

```javascript
/**
 * Construye el HTML del newsletter con KPIs y enlace.
 * @param {Object} kpis - Indicadores calculados
 * @param {Array} iniciativasAtencion - Proyectos críticos
 * @return {string} HTML del email
 */
function _construirHtmlResumenEjecutivo(kpis, iniciativasAtencion) {
  // Estructura del email:
  // - Header con branding
  // - Bullet list: estado general, tareas vencidas, iniciativas en atención
  // - Si kpis.tareasVencidas === 0 → mensaje positivo
  // - Botón CTA: "Abrir Dashboard" → WEBAPP_URL + '?vista=dashboard'
  // - Footer con nota de automatización
}

/**
 * Instala el trigger semanal para el resumen ejecutivo.
 */
function crearTriggerResumenSemanal() {
  // Eliminar triggers existentes para esta función
  // Crear nuevo trigger: weekly, día CONFIG.DIA_RESUMEN, hora CONFIG.HORA_RESUMEN
}
```

**Flujo de datos:**
```
Trigger semanal
    → enviarResumenEjecutivoSemanal()
        → _obtenerTodosLosProyectos() + _obtenerTodasLasTareas()
        → calcular KPIs (total, activos, vencidas, progreso)
        → identificarProyectosCriticos()
        → _construirHtmlResumenEjecutivo(kpis, atencion)
        → obtenerAdministradores()
        → MailApp.sendEmail() × N admins
```

---

### Requirement 15: Migración de Accesos Rápidos a Sheets

#### Archivos afectados: Codigo.js (nuevas funciones CRUD), Configuracion.js (nueva hoja), JavaScript.html / Inicio.html (migración)

**Nueva hoja en CONFIG.SHEETS:**
```javascript
ACCESOS_RAPIDOS: 'Accesos_Rapidos'
```

**Nuevas funciones globales en Codigo.js:**
```javascript
/**
 * Obtiene los accesos rápidos del usuario autenticado desde Sheets.
 * @return {Array<Object>} Accesos del usuario o array vacío
 */
function obtenerAccesosRapidos() {
  // 1. Obtener email del usuario
  // 2. Leer hoja Accesos_Rapidos
  // 3. Filtrar por Email_Usuario === email
  // 4. Retornar array de objetos
}

/**
 * Crea o actualiza un acceso rápido en Sheets.
 * @param {Object} acceso - {ID_Acceso?, Titulo, URL, Descripcion, Categoria, Icono, Color}
 * @return {Object} {success, id, mensaje}
 */
function guardarAccesoRapido(acceso) {
  // 1. Validar campos requeridos (Titulo, URL)
  // 2. Si ID_Acceso existe → buscar fila y actualizar
  // 3. Si no existe → generar nuevo ID (prefijo ACC) y appendRow
  // 4. Siempre asignar Email_Usuario del usuario autenticado
}

/**
 * Elimina un acceso rápido por ID.
 * @param {string} idAcceso
 * @return {Object} {success, mensaje}
 */
function eliminarAccesoRapido(idAcceso) {
  // 1. Buscar fila por ID_Acceso
  // 2. Verificar que Email_Usuario coincide con usuario actual
  // 3. Eliminar fila
}
```

```javascript
/**
 * Migra accesos de localStorage a Sheets.
 * @param {Array<Object>} accesosLocales - Accesos exportados del cliente
 * @return {Object} {success, migrados, mensaje}
 */
function migrarAccesosASheets(accesosLocales) {
  // 1. Validar que accesosLocales es array
  // 2. Obtener email usuario
  // 3. LockService para escritura concurrente
  // 4. Por cada acceso: generar ID, escribir fila con email
  // 5. Retornar conteo de migrados
}
```

**Flujo de migración (cliente):**
```
Inicio.html carga
    → google.script.run.obtenerAccesosRapidos()
        → SI retorna datos → renderizar desde Sheets
        → SI vacío:
            → Leer localStorage('accesos_rapidos')
            → SI hay datos locales → mostrar banner "Migrar a la nube"
                → Click "Migrar"
                → google.script.run.migrarAccesosASheets(accesosLocales)
                → Éxito → localStorage.removeItem('accesos_rapidos')
            → SI no hay datos → mostrar seeds por defecto
```

**Seguridad:**
- Cada función valida que Email_Usuario === usuario autenticado (ownership check)
- LockService en migrarAccesosASheets para evitar duplicados
- Validación de URL (no permitir javascript: ni data: URIs)

---

### Requirement 16: Edición Completa de Iniciativas

#### Archivos afectados: Codigo.js (nueva función), Index.html (modal), JavaScript.html (lógica)

**Nueva función global en Codigo.js:**
```javascript
/**
 * Actualiza múltiples campos de una iniciativa existente.
 * @param {Object} datos - {ID_Proyecto, Nombre, Descripcion, Lider, Empresa, Impacto, Startup, Aliado_URL, Estado_Gestion}
 * @return {Object} {success, mensaje}
 */
function editarIniciativaCompleta(datos) {
  // 1. Validar ID_Proyecto presente
  // 2. Verificar autorización: Propietario === usuario OR esAdministrador()
  // 3. Validaciones de negocio:
  //    - Nombre y Lider no vacíos
  //    - Empresa en CONFIG.EMPRESAS
  //    - Impacto en CONFIG.IMPACTOS
  //    - Estado_Gestion en CONFIG.ESTADOS_GESTION (si se modifica)
  // 4. Buscar fila por ID_Proyecto
  // 5. Actualizar solo campos modificados usando header-index lookup
  // 6. Retornar éxito
}
```

**Modal de edición (Index.html):**
```html
<!-- Modal edición completa de iniciativa -->
<div id="modal-editar-iniciativa" class="hidden fixed inset-0 ...">
  <form id="form-editar-iniciativa">
    <input type="hidden" id="edit-id-proyecto">
    <input id="edit-nombre" required>
    <textarea id="edit-descripcion"></textarea>
    <input id="edit-lider" required>
    <select id="edit-empresa"><!-- CONFIG.EMPRESAS --></select>
    <select id="edit-impacto"><!-- CONFIG.IMPACTOS --></select>
    <input id="edit-startup">
    <input id="edit-aliado-url" type="url">
    <select id="edit-estado-gestion"><!-- CONFIG.ESTADOS_GESTION --></select>
    <button type="submit">Guardar cambios</button>
  </form>
</div>
```

**Flujo del cliente (JavaScript.html):**
```javascript
function abrirModalEditarIniciativa(idProyecto) {
  // 1. Buscar proyecto en datos locales cargados
  // 2. Pre-poblar todos los campos del formulario
  // 3. Mostrar modal
}

function submitEditarIniciativa(event) {
  // 1. event.preventDefault()
  // 2. Recopilar valores del formulario
  // 3. google.script.run.editarIniciativaCompleta(datos)
  //    .withSuccessHandler → cerrar modal + refrescar tabla
  //    .withFailureHandler → mostrar error en modal
}
```

---

## Error Handling

### Patrón Estándar (Servidor)

```javascript
function operacionServidor(params) {
  try {
    // Validaciones de entrada (fail-fast)
    if (!params.campo) throw new Error('Campo requerido.');

    // Lógica de negocio
    // ...

    return { success: true, mensaje: 'Operación exitosa.' };
  } catch (error) {
    Logger.log('Error en operacionServidor: ' + error.message);
    throw new Error(error.message); // Mensaje genérico al cliente
  }
}
```

### Patrón de Resiliencia (Alertas/Triggers)

```javascript
// Los triggers procesan elementos individualmente con try/catch interno
// Un fallo en un elemento NO detiene el procesamiento del resto
items.forEach(function(item) {
  try {
    procesarItem(item);
  } catch (innerError) {
    Logger.log('Error en item ' + item.id + ': ' + innerError.message);
    // Continuar con el siguiente
  }
});
```

### Patrón de Escritura Concurrente

```javascript
var lock = LockService.getScriptLock();
lock.waitLock(10000); // Esperar hasta 10s
try {
  // Operación de escritura crítica (generarIdUnico, migración)
} finally {
  lock.releaseLock();
}
```

### Patrón Cliente

```javascript
google.script.run
  .withSuccessHandler(function(result) {
    if (result.success) {
      mostrarToast(result.mensaje, 'success');
      refrescarVista();
    }
  })
  .withFailureHandler(function(error) {
    mostrarToast(error.message || 'Error inesperado', 'error');
  })
  .operacionServidor(datos);
```

---

## Testing Strategy

### Enfoque Dual

Este sistema utiliza dos niveles de testing complementarios:

1. **Tests de ejemplo (unit tests):** Verifican escenarios específicos como creación exitosa, edge cases de UI, y flujos de integración con servicios externos (Drive, Mail).
2. **Tests de propiedad (property-based):** Verifican invariantes universales sobre la lógica de negocio — validación de inputs, filtrado por roles, cálculos de progreso, formato de IDs.

### Consideraciones para Google Apps Script

- Los tests se ejecutan en un entorno Node.js que mockea las APIs de GAS (SpreadsheetApp, DriveApp, MailApp, Session, LockService)
- Las funciones globales del servidor se importan como módulo para testing
- La comunicación `google.script.run` del cliente se mockea con callbacks síncronos

### Framework

- **Unit/Property tests:** Vitest + fast-check para property-based testing
- **Mocks:** Objetos stub para SpreadsheetApp, Session, DriveApp, MailApp, LockService

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: ID Format Consistency

*For any* entity created in the system (initiative, task, or sprint), the generated ID SHALL match the pattern `{PREFIX}-{yyyyMMdd}-{NNN}` where PREFIX is INI, TSK, or SPR respectively, the date is the creation date, and NNN is a zero-padded 3-digit consecutive number unique within that day.

**Validates: Requirements 1.1, 2.1, 3.1**

### Property 2: Role-Based Data Visibility

*For any* set of initiatives in the system and any authenticated user, if the user is a Gestor then `obtenerProyectos()` SHALL return only initiatives where Propietario equals the user's email AND Etapa is not "6 Iniciativa cerrada"; if the user is an Administrador then `obtenerProyectos()` SHALL return all initiatives including those in stage 6.

**Validates: Requirements 1.4, 9.2, 9.3, 9.4**

### Property 3: Input Validation Rejects Invalid Enums

*For any* Empresa value not in ['Davivienda', 'Seguros Bolívar', 'Constructora Bolívar'] OR any Impacto value not in ['Ingresos', 'Eficiencia', 'Experiencia'] OR empty Nombre OR empty Líder, the system SHALL reject initiative creation and edition with an error, leaving the data unchanged.

**Validates: Requirements 1.7, 1.8, 16.3**

### Property 4: Sprint Auto-Creation on Stage Assignment

*For any* initiative creation or stage change to a stage between 1 and 5, the system SHALL create a new Sprint associated to that initiative with Fecha_Inicio and Fecha_Fin matching the stage dates provided.

**Validates: Requirements 1.3, 2.2, 2.3**

### Property 5: Task Date Derivation from Sprint

*For any* task created (manually or automatically), the Fecha_Entrega SHALL equal the Fecha_Fin of the Sprint to which it is associated.

**Validates: Requirements 3.5, 13.5**

### Property 6: Stage Change Requires Valid Motivo

*For any* stage change request where the motivo has fewer than 5 characters or is empty, the system SHALL reject the change and leave the initiative unchanged.

**Validates: Requirements 4.1**

### Property 7: Stage Change Produces History Record

*For any* successful stage change on an initiative, a new row SHALL appear in the Historial_Etapas sheet containing the correct ID_Proyecto, Etapa_Anterior, Etapa_Nueva, Motivo, Fecha_Inicio, Fecha_Fin, timestamp, and user email.

**Validates: Requirements 4.2, 4.4**

### Property 8: Stage Change Date Calculation

*For any* successful stage change, the initiative's Fecha_Inicio SHALL be set to the day following the change date, and Fecha_Fin SHALL equal the fechaFin value provided in the request.

**Validates: Requirements 4.3**

### Property 9: Admin-Only Stage 6 and Finalizado Protection

*For any* non-administrator user, attempting to change an initiative's stage to "6 Iniciativa cerrada" SHALL be rejected with an error; and attempting to modify the Estado_Gestion of a "Finalizado" initiative SHALL be rejected with an error.

**Validates: Requirements 4.5, 9.5**

### Property 10: Overdue Task Detection

*For any* set of tasks in the system, the overdue detection function SHALL return exactly those tasks where Estado_Tarea is "Pendiente" or "En Proceso" AND Fecha_Entrega is a valid date less than or equal to today.

**Validates: Requirements 5.2**

### Property 11: Alert Email Resilience

*For any* task with an empty, null, or invalid Asignado_A field, the alert system SHALL skip that task without throwing an error; and for any individual task processing failure, the system SHALL continue processing all remaining tasks.

**Validates: Requirements 5.5, 5.6**

### Property 12: Deep Link Format

*For any* task ID, the generated deep link in alert emails SHALL contain the URL pattern `{WEBAPP_URL}?vista=tareas&tarea={ID_Tarea}` (or `&vista=tareas&tarea={ID_Tarea}` if the URL already contains query params).

**Validates: Requirements 5.4, 11.1**

### Property 13: Report Excludes Closed Initiatives

*For any* report generation (snapshot or export), no initiative with Etapa equal to "6 Iniciativa cerrada" SHALL appear in the results.

**Validates: Requirements 7.5**

### Property 14: Report Snapshot Completeness

*For any* valid filter combination, the generated report snapshot SHALL contain all seven sections: metadata, kpis, distribucionEmpresas, atencion, detalleProyectos, cargaPorPersona, and observaciones — none of which may be null or undefined.

**Validates: Requirements 7.2**

### Property 15: CSV Export Structure

*For any* dataset, the export SHALL produce an array where the first element is the project header row (20 columns), followed by project data rows, an empty separator row, a "--- DETALLE DE SPRINTS ---" marker, a sprint header row (12 columns), and sprint data rows.

**Validates: Requirements 7.4**

### Property 16: Access Export/Import Round-Trip

*For any* collection of quick access objects, exporting to JSON and then importing the same JSON SHALL produce a collection equivalent to the original (same titles, URLs, descriptions, categories, icons, colors).

**Validates: Requirements 8.5**

### Property 17: Dashboard Global Statistics

*For any* call to obtenerEstadisticasGlobales(), the returned statistics SHALL reflect ALL projects in the system regardless of the authenticated user, including counting by each enum value in ESTADOS_PROYECTO, EMPRESAS, and PRIORIDADES.

**Validates: Requirements 6.5**

### Property 18: Dashboard Filter Recalculation

*For any* active filter on the dashboard (empresa, estado, estadoTarea, estadoGestion, impacto, propietario), all displayed KPIs and chart data SHALL be computed exclusively from the subset of projects/tasks matching that filter.

**Validates: Requirements 12.3**

### Property 19: Progress Calculation from Active Sprint

*For any* initiative with sprints, the progress SHALL be calculated as the weighted average of tasks in the first sprint (by order) that has at least one task in "Pendiente" or "En Proceso" state, using weights: Completada=100, En Proceso=50, Pendiente=0. If no such sprint exists (all completed), progress SHALL be 0.

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 20: Auto-Tasks from Catalog

*For any* initiative creation or stage change to a stage N (1–5), the system SHALL create exactly the tasks listed in TAREAS_POR_ETAPA[N], each with Asignado_A equal to the initiative's Propietario email, associated to the newly created sprint. If N=6 or the catalog has no entries, no tasks SHALL be created.

**Validates: Requirements 13.2, 13.3, 13.4, 13.6**

### Property 21: Newsletter KPI Calculation and Format

*For any* execution of the weekly newsletter trigger, the email body SHALL contain bullet points listing total initiatives, active count, overdue tasks count, and overall progress percentage; and if there are zero overdue tasks and no critical initiatives, a positive status statement SHALL be included.

**Validates: Requirements 14.2, 14.3, 14.6**

### Property 22: Newsletter Recipients from Config

*For any* execution of the weekly newsletter, the email SHALL be sent to exactly those users listed in the Configuracion_Sheet with an Admin role — no more, no fewer.

**Validates: Requirements 14.5**

### Property 23: Accesses Filtered by User Email

*For any* authenticated user, `obtenerAccesosRapidos()` SHALL return only access records where Email_Usuario matches the user's email — never records belonging to other users.

**Validates: Requirements 15.3**

### Property 24: Migration Completeness

*For any* set of localStorage accesses submitted for migration, after successful completion of `migrarAccesosASheets()`, the Accesos_Rapidos sheet SHALL contain one row for each access with all fields preserved (Titulo, URL, Descripcion, Categoria, Icono, Color) and Email_Usuario set to the current user.

**Validates: Requirements 15.5**

### Property 25: Edit Persists All Modified Fields

*For any* valid edit submission via `editarIniciativaCompleta()`, re-reading the initiative SHALL reflect the updated values for every field that was modified in the submission.

**Validates: Requirements 16.2**

### Property 26: Edit Authorization

*For any* user who is neither the Propietario of the initiative nor an Administrador, calling `editarIniciativaCompleta()` SHALL be rejected with a permissions error, leaving the initiative data unchanged.

**Validates: Requirements 16.4**
