# Requirements Document

## Introduction

Sistema de seguimiento y gestión de iniciativas de aceleración de la Vicepresidencia de Innovación del Grupo Bolívar. Construido sobre Google Apps Script + Google Sheets + Google Drive, con frontend SPA servido mediante HtmlService. Este documento formaliza los requerimientos del sistema existente (implementados) y las funcionalidades planificadas.

## Glossary

- **Sistema**: Aplicación web OPI Aceleración desplegada como Google Apps Script Web App
- **Gestor**: Usuario con rol operativo que crea y administra sus propias iniciativas
- **Administrador**: Usuario con rol privilegiado que ve todas las iniciativas y puede cerrarlas formalmente
- **Iniciativa**: Proyecto de innovación gestionado en el sistema, almacenado en la hoja Proyectos
- **Etapa**: Fase del proceso de aceleración según Metodología OPI 2026 (1 DISCOVERY, 2 CONCEPT STUDIO, 3 PROJECT SETUP, 4 DELIVERY ENGINE, 5 LAUNCHPAD, 6 Iniciativa cerrada)
- **Estado_Gestion**: Estado operativo de una iniciativa (Activo, En Pausa, Finalizado)
- **Sprint**: Periodo de trabajo asociado a una iniciativa con fecha inicio y fin
- **Tarea**: Actividad asociada a una iniciativa y a un sprint, con estados Pendiente/En Proceso/Completada
- **Kanban**: Vista de tareas organizada en tres columnas por estado
- **Dashboard**: Vista consolidada con KPIs y gráficos del portafolio
- **Historial_Etapas**: Hoja que registra cada cambio de etapa con motivo, fechas y usuario
- **TAREAS_POR_ETAPA**: Catálogo de tareas automáticas predefinidas por etapa según Metodología OPI 2026
- **Resumen_Ejecutivo**: Correo periódico con indicadores clave del portafolio y enlace a la aplicación
- **Accesos_Rapidos**: Módulo de enlaces rápidos personalizables por usuario
- **Configuracion_Sheet**: Hoja "Configuración" que define correos y roles de usuarios del sistema
- **Deep_Link**: URL con parámetros que dirige al usuario a una tarea específica dentro de la aplicación

## Requirements

### Requirement 1: Gestión CRUD de Iniciativas [IMPLEMENTED]

**User Story:** As a Gestor, I want to create, list, and delete initiatives, so that I can manage my innovation portfolio.

#### Acceptance Criteria

1. WHEN the Gestor submits the initiative creation form with Nombre, Líder, Empresa and Impacto, THE Sistema SHALL create a new row in the hoja Proyectos with a unique ID (prefijo INI + fecha + consecutivo), etapa inicial "1 DISCOVERY (Investigación)" and Estado_Gestion "Activo".
2. WHEN the Gestor creates an initiative, THE Sistema SHALL create a folder structure in Google Drive with four subfolders (Documentos aliado, Documentos legales, Documentos comerciales, Documentos riesgos) and store the folder URL in the initiative row.
3. WHEN the Gestor creates an initiative, THE Sistema SHALL create an initial Sprint associated to the initiative with the dates provided in the form.
4. WHEN the Gestor requests the initiative list, THE Sistema SHALL return only initiatives where the Propietario field matches the authenticated user email.
5. WHEN the Gestor requests deletion of an initiative, THE Sistema SHALL remove the corresponding row from the hoja Proyectos.
6. THE Sistema SHALL provide five filters on the initiative list: text search (nombre, ID, líder, aliado), etapa, empresa, líder, and situación (atrasado, en tiempo, adelantado, sin fechas).
7. IF the Empresa value provided is not in the allowed list (Davivienda, Seguros Bolívar, Constructora Bolívar), THEN THE Sistema SHALL reject the creation with an error message.
8. IF the Impacto value provided is not in the allowed list (Ingresos, Eficiencia, Experiencia), THEN THE Sistema SHALL reject the creation with an error message.

---

### Requirement 2: Gestión de Sprints [IMPLEMENTED]

**User Story:** As a Gestor, I want to create sprints and associate them to my initiatives, so that I can plan iterative work cycles.

#### Acceptance Criteria

1. WHEN the Gestor creates a Sprint with ID_Proyecto, Nombre, Fecha_Inicio and Fecha_Fin, THE Sistema SHALL generate a unique ID (prefijo SPR + fecha + consecutivo) and append the Sprint to the hoja Sprints.
2. WHEN the Gestor creates an initiative, THE Sistema SHALL automatically create a Sprint inicial named "Sprint 1" (or a custom name) with the dates of the first stage.
3. WHEN a stage change occurs on an initiative, THE Sistema SHALL automatically create a new Sprint for the new stage with the corresponding dates.
4. THE Sistema SHALL allow listing all Sprints of a given initiative ordered by creation.

---

### Requirement 3: Gestión de Tareas con Kanban [IMPLEMENTED]

**User Story:** As a Gestor, I want to manage tasks in a Kanban board, so that I can track the progress of each sprint.

#### Acceptance Criteria

1. WHEN the Gestor creates a task, THE Sistema SHALL generate a unique ID (prefijo TSK + fecha + consecutivo), associate the task to the selected Sprint, and set Estado_Tarea to "Pendiente".
2. THE Sistema SHALL display tasks in three Kanban columns: Pendiente, En Proceso, and Completada.
3. WHEN the Gestor changes the Estado_Tarea of a task, THE Sistema SHALL update the Estado_Tarea field in the hoja Tareas immediately.
4. THE Sistema SHALL provide four filters on the Kanban view: proyecto, fase, responsable, and vigencia (vigentes, atrasadas).
5. WHEN the Gestor creates a task, THE Sistema SHALL assign the Fecha_Entrega from the Fecha_Fin of the selected Sprint.

---

### Requirement 4: Cambio de Etapa con Historial [IMPLEMENTED]

**User Story:** As a Gestor, I want to change the stage of an initiative with a mandatory rationale, so that every phase transition is documented.

#### Acceptance Criteria

1. WHEN the Gestor changes the etapa of an initiative, THE Sistema SHALL require a motivo of at least 5 characters and a Fecha_Fin for the new stage.
2. WHEN a stage change is confirmed, THE Sistema SHALL append a row to the Historial_Etapas sheet with ID_Proyecto, Etapa_Anterior, Etapa_Nueva, Motivo, Fecha_Inicio, Fecha_Fin, Fecha_Cambio (timestamp), and Usuario (email).
3. WHEN a stage change is confirmed, THE Sistema SHALL update the Fecha_Inicio of the initiative to the day following the change and the Fecha_Fin to the provided date.
4. WHEN a stage change is confirmed, THE Sistema SHALL register the transition in the Comentarios field of the initiative row with timestamp, user, and motivo.
5. IF the new stage is "6 Iniciativa cerrada" and the user is not an Administrador, THEN THE Sistema SHALL reject the change with an error message indicating insufficient permissions.

---

### Requirement 5: Alertas Diarias por Correo [IMPLEMENTED]

**User Story:** As a Gestor, I want to receive daily email alerts for overdue tasks, so that I can take corrective action promptly.

#### Acceptance Criteria

1. THE Sistema SHALL execute the alert function daily at 8:00 AM via a time-based trigger.
2. WHEN the trigger fires, THE Sistema SHALL identify all tasks with Estado_Tarea "Pendiente" or "En Proceso" whose Fecha_Entrega is equal to or earlier than today.
3. WHEN an overdue task is identified, THE Sistema SHALL send an HTML email to the Asignado_A address with task name, project name, due date, priority, and overdue days count.
4. WHEN an overdue task email is sent, THE Sistema SHALL include a deep link button that opens the application and navigates directly to that task.
5. IF the Asignado_A field is empty or does not contain a valid email address, THEN THE Sistema SHALL skip that task and log a warning without stopping the process.
6. IF an error occurs processing one task, THEN THE Sistema SHALL log the error and continue processing the remaining tasks.

---

### Requirement 6: Dashboard con KPIs y Gráficos [IMPLEMENTED]

**User Story:** As a Gestor, I want to see a consolidated dashboard with KPIs and charts, so that I can monitor the overall portfolio health.

#### Acceptance Criteria

1. THE Sistema SHALL display three primary KPIs: Total Iniciativas, Activos (stages 1-5 excluding blocked), and Tareas Pendientes.
2. THE Sistema SHALL render six charts: Estado de Iniciativas (bar), Iniciativas por Empresa (horizontal bar), Tareas por Estado (bar), Estado de Gestión (doughnut), Impacto de Iniciativas (horizontal bar), and Top Propietarios (horizontal bar).
3. WHEN a user clicks on a chart segment, THE Sistema SHALL apply a filter to the dashboard showing only initiatives/tasks matching the clicked dimension.
4. WHEN a dashboard filter is active, THE Sistema SHALL display a filter bar with the active filter description and a "Limpiar filtros" button.
5. THE Sistema SHALL calculate dashboard statistics from all projects (global view) regardless of the authenticated user.

---

### Requirement 7: Módulo de Reportes [IMPLEMENTED]

**User Story:** As a Gestor, I want to generate executive report snapshots, so that I can share portfolio status with stakeholders.

#### Acceptance Criteria

1. THE Sistema SHALL provide three report filters: Empresa, Estado de tareas (vigentes/completadas/todas), and Tipo de reporte (completo/solo atención).
2. WHEN the Gestor clicks "Generar reporte", THE Sistema SHALL build a snapshot with metadata, KPIs, distribution by company, critical projects, project details with sprint summaries, workload by person, and automatic observations.
3. WHEN the report is generated, THE Sistema SHALL provide a print/PDF button that uses html2pdf.js for export.
4. WHEN the Gestor requests CSV export, THE Sistema SHALL generate a two-section export: project summary rows followed by sprint detail rows with all relevant columns.
5. THE Sistema SHALL exclude initiatives in stage "6 Iniciativa cerrada" from reports.

---

### Requirement 8: Accesos Rápidos [IMPLEMENTED]

**User Story:** As a Gestor, I want to manage quick access links to my frequently used resources, so that I have a personalized landing page.

#### Acceptance Criteria

1. THE Sistema SHALL display a grid of access cards with title, description, category, icon, and configurable color on the Inicio view.
2. WHEN the Gestor creates an access, THE Sistema SHALL store it in localStorage with a unique ID, title, URL, description, category, icon, and color.
3. THE Sistema SHALL allow editing and deleting existing quick access links.
4. THE Sistema SHALL provide category chip filters and a text search field to filter accesses.
5. THE Sistema SHALL support export (JSON download) and import (JSON upload) of quick access collections.
6. WHEN the application loads for the first time, THE Sistema SHALL initialize with three seed accesses (hoja de cálculo, Google Drive, Calendar).

---

### Requirement 9: Control de Acceso Basado en Roles [IMPLEMENTED]

**User Story:** As an Administrador, I want to have elevated permissions, so that I can manage the full portfolio lifecycle including closing initiatives.

#### Acceptance Criteria

1. THE Sistema SHALL determine the user role by reading the Configuracion_Sheet where each row contains an email and a role designation.
2. WHILE the user is an Administrador, THE Sistema SHALL display all initiatives including those in stage "6 Iniciativa cerrada".
3. WHILE the user is a Gestor, THE Sistema SHALL hide initiatives in stage "6 Iniciativa cerrada" from the list and filter options.
4. WHILE the user is a Gestor, THE Sistema SHALL restrict the initiative list to only those where the Propietario field matches the user email.
5. IF a non-Administrador user attempts to change the Estado_Gestion of a "Finalizado" initiative, THEN THE Sistema SHALL reject the change with an insufficient permissions error.

---

### Requirement 10: Progreso Calculado desde Sprint Vigente [IMPLEMENTED]

**User Story:** As a Gestor, I want the progress percentage to be calculated automatically from my active sprint, so that I always see an accurate real-time metric.

#### Acceptance Criteria

1. THE Sistema SHALL determine the Sprint vigente as the first Sprint (by order) that has at least one task in Estado_Tarea "Pendiente" or "En Proceso".
2. WHEN the Sprint vigente is identified, THE Sistema SHALL calculate progress as the weighted average: Completada = 100, En Proceso = 50, Pendiente = 0, divided by total tasks in that Sprint.
3. WHEN all Sprints of an initiative have all tasks completed, THE Sistema SHALL display 0% progress (no active Sprint).
4. THE Sistema SHALL display the Fecha_Inicio and Fecha_Fin of the Sprint vigente (not the initiative dates) in the initiative table.

---

### Requirement 11: Deep Links desde Alertas [IMPLEMENTED]

**User Story:** As a Gestor, I want email alert links to navigate me directly to the specific task, so that I can take action without searching.

#### Acceptance Criteria

1. WHEN an alert email is sent, THE Sistema SHALL include a link with query parameters `vista=tareas&tarea={ID_Tarea}` appended to the WEBAPP_URL.
2. WHEN the application receives URL parameters, THE Sistema SHALL switch to the Tareas view, clear all filters, and scroll to the referenced task card.
3. WHEN the referenced task card is found, THE Sistema SHALL apply a visual highlight animation for 6 seconds.
4. IF the referenced task is not found in the current list, THEN THE Sistema SHALL display an informational toast message.

---

### Requirement 12: Filtro Interactivo del Dashboard [IMPLEMENTED]

**User Story:** As a Gestor, I want to click on chart elements to filter the dashboard, so that I can drill down into specific segments interactively.

#### Acceptance Criteria

1. WHEN the user clicks on a bar/segment in any dashboard chart, THE Sistema SHALL apply a filter by the corresponding dimension (empresa, estado, estadoTarea, estadoGestion, impacto, propietario).
2. WHEN the user clicks on an already-active filter segment, THE Sistema SHALL clear the filter (toggle behavior).
3. WHEN a filter is active, THE Sistema SHALL recalculate all KPIs and re-render all charts using only the filtered subset of data.

---

### Requirement 13: Tareas Automáticas por Etapa [IMPLEMENTED — Parcial]

**User Story:** As a Gestor, I want the system to create predefined tasks when an initiative enters a new stage, so that I have a structured starting point per methodology phase.

#### Acceptance Criteria

1. THE Sistema SHALL maintain a TAREAS_POR_ETAPA catalog defining predefined task names for each of the 5 active stages according to Metodología OPI 2026.
2. WHEN an initiative is created, THE Sistema SHALL create tasks from the TAREAS_POR_ETAPA catalog corresponding to the initial stage, associated to the initial Sprint.
3. WHEN an initiative changes stage, THE Sistema SHALL create tasks from the TAREAS_POR_ETAPA catalog corresponding to the new stage, associated to the newly created Sprint.
4. WHEN auto-tasks are created, THE Sistema SHALL assign the Asignado_A field to the initiative Propietario email.
5. WHEN auto-tasks are created, THE Sistema SHALL set the Fecha_Entrega to the Fecha_Fin of the associated Sprint.
6. IF the TAREAS_POR_ETAPA catalog does not have entries for the target stage (e.g., stage 6), THEN THE Sistema SHALL skip auto-task creation without error.

---

### Requirement 14: Resumen Ejecutivo Periódico [PLANNED]

**User Story:** As an Administrador, I want to receive a weekly executive summary email, so that I can monitor portfolio health without opening the application.

#### Acceptance Criteria

1. THE Sistema SHALL send the Resumen_Ejecutivo email once per week via a time-based trigger on a configurable day and hour.
2. WHEN the trigger fires, THE Sistema SHALL calculate KPIs: total initiatives, active initiatives, overdue tasks count, and overall progress percentage.
3. THE Sistema SHALL format the email as a brief newsletter with bullet points listing: general portfolio status, count of overdue tasks, and initiatives requiring attention.
4. THE Sistema SHALL include a deep link button in the email that opens the Dashboard view of the application.
5. THE Sistema SHALL send the Resumen_Ejecutivo to all users with Administrador role as listed in the Configuracion_Sheet.
6. IF no overdue tasks exist and all initiatives are on track, THEN THE Sistema SHALL include a positive status statement in the newsletter.

---

### Requirement 15: Migración de Accesos Rápidos a Sheets [PLANNED]

**User Story:** As a Gestor, I want my quick access links to persist across devices, so that I see the same links regardless of the browser or machine I use.

#### Acceptance Criteria

1. THE Sistema SHALL store quick access links in a dedicated hoja "Accesos_Rapidos" with columns: ID_Acceso, Email_Usuario, Titulo, URL, Descripcion, Categoria, Icono, Color.
2. WHEN the Gestor creates or edits an access, THE Sistema SHALL write the data to the Accesos_Rapidos sheet associated to the user email.
3. WHEN the Gestor loads the Inicio view, THE Sistema SHALL retrieve accesses from the Accesos_Rapidos sheet filtered by the authenticated user email.
4. IF the Accesos_Rapidos sheet is unavailable or empty for the user, THEN THE Sistema SHALL fall back to localStorage data and offer to migrate existing local accesses to Sheets.
5. WHEN the migration is initiated, THE Sistema SHALL copy all localStorage accesses to the Accesos_Rapidos sheet and clear the local storage key upon success.

---

### Requirement 16: Edición Completa de Iniciativas [PLANNED]

**User Story:** As a Gestor, I want to edit all fields of an existing initiative through a modal form, so that I can correct or update information without recreating the initiative.

#### Acceptance Criteria

1. WHEN the Gestor opens the edit modal for an initiative, THE Sistema SHALL pre-populate all fields (Nombre, Descripción, Líder, Empresa, Impacto, Startup, Aliado_URL, Estado_Gestion) with the current values.
2. WHEN the Gestor submits the edit form, THE Sistema SHALL update the corresponding row in the hoja Proyectos for all modified fields.
3. THE Sistema SHALL validate that Nombre and Líder are not empty, that Empresa is in the allowed list, and that Impacto is in the allowed list before saving.
4. IF the Gestor is not the Propietario of the initiative and is not an Administrador, THEN THE Sistema SHALL reject the edit with an insufficient permissions error.
5. WHEN the edit is saved successfully, THE Sistema SHALL refresh the initiative table to reflect the updated data.
