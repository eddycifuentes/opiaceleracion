# Implementation Plan: OPI Aceleración System — Testing & New Features

## Overview

This plan covers two main areas: (1) setting up a testing infrastructure with property-based tests (Vitest + fast-check) to validate the 26 correctness properties of the existing system (Requirements 1–13), and (2) implementing the three planned features (Requirements 14–16). The implementation language is JavaScript (Google Apps Script style), with tests running in Node.js via Vitest.

## Tasks

- [ ] 1. Set up testing infrastructure
  - [ ] 1.1 Initialize Node.js project and install testing dependencies
    - Create `package.json` with Vitest and fast-check as dev dependencies (pinned versions)
    - Create `vitest.config.js` with global setup for GAS mocks
    - Create directory structure: `tests/`, `tests/mocks/`, `tests/properties/`, `tests/unit/`
    - _Requirements: All (testing foundation)_

  - [ ] 1.2 Create Google Apps Script mock layer
    - Create `tests/mocks/gas-mocks.js` with mock implementations for:
      - `SpreadsheetApp` (openById, getSheetByName, getDataRange, getValues, appendRow, deleteRow)
      - `DriveApp` (createFolder, getFolderById)
      - `MailApp` (sendEmail, getRemainingDailyQuota)
      - `Session` (getActiveUser → getEmail)
      - `LockService` (getScriptLock → waitLock, releaseLock)
      - `ScriptApp` (getProjectTriggers, newTrigger, deleteTrigger, getService)
      - `Logger` (log)
    - Each mock must be configurable (inject data, verify calls)
    - _Requirements: All (mock foundation for GAS APIs)_

  - [ ] 1.3 Create module loader for global GAS functions
    - Create `tests/helpers/load-gas-modules.js` that reads `.js` source files and evaluates them into a sandboxed context with mocked globals
    - Expose server functions (obtenerProyectos, crearProyecto, etc.) as importable objects for tests
    - Include CONFIG from Configuracion.js in the sandbox
    - _Requirements: All (enables testing global functions in Node.js)_

- [ ] 2. Checkpoint — Verify testing infrastructure works
  - Ensure a trivial test passes with `npx vitest run`, confirm GAS mocks load correctly, ask the user if questions arise.

- [ ] 3. Property-based tests for ID generation and data integrity (Req 1-3)
  - [ ]* 3.1 Write property test for ID format consistency
    - **Property 1: ID Format Consistency**
    - Test that `generarIdUnico(prefijo, sheet)` always produces IDs matching `{PREFIX}-{yyyyMMdd}-{NNN}` for prefixes INI, TSK, SPR
    - Use fast-check arbitraries for date seeds and sheet row counts
    - **Validates: Requirements 1.1, 2.1, 3.1**

  - [ ]* 3.2 Write property test for role-based data visibility
    - **Property 2: Role-Based Data Visibility**
    - Test that `obtenerProyectos()` returns only user-owned initiatives for Gestors, and all initiatives for Admins
    - Generate arbitrary project sets with different Propietario emails and stages
    - **Validates: Requirements 1.4, 9.2, 9.3, 9.4**

  - [ ]* 3.3 Write property test for input validation on enums
    - **Property 3: Input Validation Rejects Invalid Enums**
    - Test that `crearProyecto()` rejects any Empresa not in CONFIG.EMPRESAS, any Impacto not in CONFIG.IMPACTOS, and empty Nombre/Líder
    - Use fast-check to generate strings outside the valid enum sets
    - **Validates: Requirements 1.7, 1.8, 16.3**

- [ ] 4. Property-based tests for sprints and tasks (Req 2-3, 13)
  - [ ]* 4.1 Write property test for sprint auto-creation on stage assignment
    - **Property 4: Sprint Auto-Creation on Stage Assignment**
    - Test that creating an initiative or changing stage (1-5) always produces a new Sprint
    - **Validates: Requirements 1.3, 2.2, 2.3**

  - [ ]* 4.2 Write property test for task date derivation from sprint
    - **Property 5: Task Date Derivation from Sprint**
    - Test that any created task has Fecha_Entrega equal to Sprint.Fecha_Fin
    - **Validates: Requirements 3.5, 13.5**

  - [ ]* 4.3 Write property test for auto-tasks from catalog
    - **Property 20: Auto-Tasks from Catalog**
    - Test that stage changes create exactly the tasks in TAREAS_POR_ETAPA[N], assigned to Propietario, linked to new sprint. Stage 6 creates zero tasks.
    - **Validates: Requirements 13.2, 13.3, 13.4, 13.6**

- [ ] 5. Property-based tests for stage changes and history (Req 4, 9)
  - [ ]* 5.1 Write property test for stage change motivo validation
    - **Property 6: Stage Change Requires Valid Motivo**
    - Test that `cambiarEtapaProyecto()` rejects motivos < 5 chars
    - **Validates: Requirements 4.1**

  - [ ]* 5.2 Write property test for stage change history record
    - **Property 7: Stage Change Produces History Record**
    - Test that every successful stage change appends correct row to Historial_Etapas
    - **Validates: Requirements 4.2, 4.4**

  - [ ]* 5.3 Write property test for stage change date calculation
    - **Property 8: Stage Change Date Calculation**
    - Test that Fecha_Inicio = day after change and Fecha_Fin = provided date
    - **Validates: Requirements 4.3**

  - [ ]* 5.4 Write property test for admin-only stage 6 protection
    - **Property 9: Admin-Only Stage 6 and Finalizado Protection**
    - Test that non-admins cannot change to stage 6 or modify Finalizado Estado_Gestion
    - **Validates: Requirements 4.5, 9.5**

- [ ] 6. Property-based tests for alerts and deep links (Req 5, 11)
  - [ ]* 6.1 Write property test for overdue task detection
    - **Property 10: Overdue Task Detection**
    - Test that alert filter returns exactly tasks with Pendiente/En Proceso status and Fecha_Entrega ≤ today
    - **Validates: Requirements 5.2**

  - [ ]* 6.2 Write property test for alert email resilience
    - **Property 11: Alert Email Resilience**
    - Test that invalid/empty Asignado_A is skipped without error, and one task failure doesn't stop the rest
    - **Validates: Requirements 5.5, 5.6**

  - [ ]* 6.3 Write property test for deep link format
    - **Property 12: Deep Link Format**
    - Test that generated links always contain `{WEBAPP_URL}?vista=tareas&tarea={ID_Tarea}` pattern
    - **Validates: Requirements 5.4, 11.1**

- [ ] 7. Property-based tests for reports and dashboard (Req 6, 7, 10, 12)
  - [ ]* 7.1 Write property test for report excludes closed initiatives
    - **Property 13: Report Excludes Closed Initiatives**
    - Test that `generarReporteSnapshot()` never includes stage "6 Iniciativa cerrada" projects
    - **Validates: Requirements 7.5**

  - [ ]* 7.2 Write property test for report snapshot completeness
    - **Property 14: Report Snapshot Completeness**
    - Test that snapshot always contains all 7 sections (metadata, kpis, distribucionEmpresas, atencion, detalleProyectos, cargaPorPersona, observaciones)
    - **Validates: Requirements 7.2**

  - [ ]* 7.3 Write property test for CSV export structure
    - **Property 15: CSV Export Structure**
    - Test that export produces header row (20 cols), data rows, separator, sprint marker, sprint header (12 cols), sprint rows
    - **Validates: Requirements 7.4**

  - [ ]* 7.4 Write property test for dashboard global statistics
    - **Property 17: Dashboard Global Statistics**
    - Test that `obtenerEstadisticasGlobales()` counts ALL projects regardless of user
    - **Validates: Requirements 6.5**

  - [ ]* 7.5 Write property test for dashboard filter recalculation
    - **Property 18: Dashboard Filter Recalculation**
    - Test that filtered stats reflect only the matching subset of projects/tasks
    - **Validates: Requirements 12.3**

  - [ ]* 7.6 Write property test for progress calculation from active sprint
    - **Property 19: Progress Calculation from Active Sprint**
    - Test weighted average: Completada=100, En Proceso=50, Pendiente=0, using first sprint with active tasks
    - **Validates: Requirements 10.1, 10.2, 10.3**

- [ ] 8. Checkpoint — Validate property tests for existing code
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Requirement 14: Resumen Ejecutivo Periódico
  - [ ] 9.1 Add newsletter configuration constants to Configuracion.js
    - Add `ASUNTO_RESUMEN`, `DIA_RESUMEN` (1=Monday), and `HORA_RESUMEN` (7) to CONFIG object
    - _Requirements: 14.1_

  - [ ] 9.2 Implement `enviarResumenEjecutivoSemanal()` in Alertas.js
    - Fetch all projects and tasks via `_obtenerTodosLosProyectos()` / `_obtenerTodasLasTareas()`
    - Calculate KPIs: total initiatives, active (stages 1-5, not En Pausa), overdue tasks count, overall progress %
    - Identify critical initiatives (overdue + En Pausa) via `identificarProyectosCriticos()`
    - Build HTML email via `_construirHtmlResumenEjecutivo(kpis, iniciativasAtencion)`
    - Send to all administrators from `obtenerAdministradores()`
    - Use try/catch with Logger.log for error handling
    - _Requirements: 14.1, 14.2, 14.3, 14.5_

  - [ ] 9.3 Implement `_construirHtmlResumenEjecutivo(kpis, iniciativasAtencion)` in Alertas.js
    - HTML newsletter structure: header with branding, bullet list (general status, overdue count, initiatives needing attention)
    - If kpis.tareasVencidas === 0 AND no critical initiatives → include positive status statement
    - Deep link button "Abrir Dashboard" → `CONFIG.WEBAPP_URL + '?vista=dashboard'`
    - Footer with automation note
    - _Requirements: 14.3, 14.4, 14.6_

  - [ ] 9.4 Implement `crearTriggerResumenSemanal()` in Alertas.js
    - Delete existing triggers for `enviarResumenEjecutivoSemanal`
    - Create weekly trigger on CONFIG.DIA_RESUMEN at CONFIG.HORA_RESUMEN
    - _Requirements: 14.1_

- [ ] 10. Checkpoint — Validate Requirement 14 implementation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement Requirement 15: Migración de Accesos Rápidos a Sheets
  - [ ] 11.1 Add Accesos_Rapidos sheet name to CONFIG and define PREFIJO_ACCESO
    - Add `SHEETS.ACCESOS_RAPIDOS: 'Accesos_Rapidos'` to CONFIG
    - Add `PREFIJO_ACCESO: 'ACC'` to CONFIG
    - _Requirements: 15.1_

  - [ ] 11.2 Implement `obtenerAccesosRapidos()` in Codigo.js
    - Get current user email via `obtenerEmailUsuario()`
    - Read Accesos_Rapidos sheet, filter rows by Email_Usuario === email
    - Return array of access objects (or empty array if sheet doesn't exist)
    - _Requirements: 15.3_

  - [ ] 11.3 Implement `guardarAccesoRapido(acceso)` in Codigo.js
    - Validate required fields: Titulo (not empty), URL (not empty, no `javascript:` or `data:` URIs)
    - If `acceso.ID_Acceso` exists → find row and update
    - If no ID → generate new ID with `generarIdUnico('ACC', sheet)` and appendRow
    - Always set Email_Usuario to authenticated user email
    - Return `{success, id, mensaje}`
    - _Requirements: 15.1, 15.2_

  - [ ] 11.4 Implement `eliminarAccesoRapido(idAcceso)` in Codigo.js
    - Find row by ID_Acceso in Accesos_Rapidos sheet
    - Verify Email_Usuario matches current user (ownership check)
    - Delete row and return `{success, mensaje}`
    - _Requirements: 15.2_

  - [ ] 11.5 Implement `migrarAccesosASheets(accesosLocales)` in Codigo.js
    - Validate accesosLocales is an array
    - Get email, acquire LockService for concurrent write protection
    - For each access: generate ID, validate URL, write row with user email
    - Return `{success, migrados, mensaje}`
    - _Requirements: 15.4, 15.5_

  - [ ] 11.6 Update Inicio.html to use Sheets-backed accesses
    - On load: call `google.script.run.obtenerAccesosRapidos()`
    - If data returned → render from Sheets
    - If empty → check localStorage for existing data → show migration banner if found
    - Wire migration button to `migrarAccesosASheets()` → on success clear localStorage
    - Update create/edit/delete to call server functions instead of localStorage
    - _Requirements: 15.3, 15.4, 15.5_

- [ ] 12. Implement Requirement 16: Edición Completa de Iniciativas
  - [ ] 12.1 Implement `editarIniciativaCompleta(datos)` in Codigo.js
    - Validate ID_Proyecto present
    - Authorization: Propietario === current user OR esAdministrador()
    - Business validations: Nombre/Líder not empty, Empresa in CONFIG.EMPRESAS, Impacto in CONFIG.IMPACTOS
    - Find row by ID_Proyecto, update only modified fields via header-index lookup
    - Return `{success, mensaje}`
    - _Requirements: 16.2, 16.3, 16.4_

  - [ ] 12.2 Add edit initiative modal to Index.html
    - Hidden modal with form: fields for Nombre, Descripción, Líder, Empresa (select), Impacto (select), Startup, Aliado_URL, Estado_Gestion (select)
    - Hidden input for ID_Proyecto
    - Submit button "Guardar cambios"
    - _Requirements: 16.1_

  - [ ] 12.3 Add edit logic to JavaScript.html
    - `abrirModalEditarIniciativa(idProyecto)`: find project in local data, pre-populate all form fields, show modal
    - `submitEditarIniciativa(event)`: preventDefault, collect form values, call `google.script.run.editarIniciativaCompleta(datos)`
    - Success handler: close modal, refresh initiative table, show success toast
    - Failure handler: show error in modal
    - Add edit button to initiative table/cards
    - _Requirements: 16.1, 16.2, 16.5_

- [ ] 13. Checkpoint — Validate Requirements 15-16 implementation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Property-based tests for new features (Req 14-16)
  - [ ]* 14.1 Write property test for newsletter KPI calculation
    - **Property 21: Newsletter KPI Calculation and Format**
    - Test that email body contains bullet points with total, active, overdue, progress; positive statement when no issues
    - **Validates: Requirements 14.2, 14.3, 14.6**

  - [ ]* 14.2 Write property test for newsletter recipients
    - **Property 22: Newsletter Recipients from Config**
    - Test that email is sent to exactly the admin users from Configuracion_Sheet
    - **Validates: Requirements 14.5**

  - [ ]* 14.3 Write property test for accesses filtered by user email
    - **Property 23: Accesses Filtered by User Email**
    - Test that `obtenerAccesosRapidos()` returns only records matching current user email
    - **Validates: Requirements 15.3**

  - [ ]* 14.4 Write property test for migration completeness
    - **Property 24: Migration Completeness**
    - Test that after `migrarAccesosASheets()`, sheet contains one row per input access with all fields preserved and correct email
    - **Validates: Requirements 15.5**

  - [ ]* 14.5 Write property test for access export/import round-trip
    - **Property 16: Access Export/Import Round-Trip**
    - Test that exporting to JSON and importing produces equivalent collection
    - **Validates: Requirements 8.5**

  - [ ]* 14.6 Write property test for edit persists all modified fields
    - **Property 25: Edit Persists All Modified Fields**
    - Test that re-reading an initiative after edit reflects all updated values
    - **Validates: Requirements 16.2**

  - [ ]* 14.7 Write property test for edit authorization
    - **Property 26: Edit Authorization**
    - Test that non-owner non-admin users are rejected with permissions error
    - **Validates: Requirements 16.4**

- [ ] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Requirements 1–13 are already implemented — tasks 3–7 focus on testing/validation only
- Requirements 14–16 are new — tasks 9, 11, 12 contain full implementation
- GAS mock layer is critical: tests run in Node.js, not in GAS runtime
- All server functions are global (no modules) — the test loader evaluates source files into a sandbox
- Property tests use fast-check arbitraries to generate edge cases automatically
- Checkpoints ensure incremental validation between phases

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["3.1", "3.2", "3.3"] },
    { "id": 4, "tasks": ["4.1", "4.2", "4.3", "5.1", "5.2", "5.3", "5.4"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 6, "tasks": ["9.1", "11.1"] },
    { "id": 7, "tasks": ["9.2", "9.3", "9.4", "11.2", "11.3", "11.4"] },
    { "id": 8, "tasks": ["11.5", "11.6", "12.1"] },
    { "id": 9, "tasks": ["12.2", "12.3"] },
    { "id": 10, "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5", "14.6", "14.7"] }
  ]
}
```
