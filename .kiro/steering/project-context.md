# Contexto del proyecto — OPI Aceleración

## Qué es este proyecto
Sistema de seguimiento de iniciativas de la Vicepresidencia de Innovación
del Grupo Bolívar. Construido sobre Google Apps Script + Google Sheets + 
Google Drive. Frontend como SPA en HtmlService.

## Restricciones del entorno — SIEMPRE respetar

### Google Apps Script (.js / archivos de servidor)
- NO usar async/await ni Promise. GAS es síncrono.
- NO usar require() ni import. GAS no tiene módulos.
- NO usar fetch(). Usar UrlFetchApp para HTTP.
- NO usar console.log(). Usar Logger.log().
- Para Sheets: SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
- Para errores: throw new Error(mensaje) con try/catch
- Para escrituras críticas: LockService.getScriptLock()
- Todas las funciones del servidor deben ser globales

### Cliente (.html)
- Llamadas al servidor SIEMPRE con:
  google.script.run
    .withSuccessHandler(fn)
    .withFailureHandler(fn)
    .nombreFuncion(args)
- Sin frameworks modernos. HTML/CSS/JS puro + Tailwind CDN

## Convenciones de código
- Comentarios en español
- JSDoc en cada función nueva
- Manejo de errores: try/catch + Logger.log() en el catch
- IDs únicos: usar generarIdUnico(prefijo, sheet) de Servicios.js

## Convenciones de commits
- feat: nueva funcionalidad
- fix: corrección de bug
- refactor: cambio sin nueva funcionalidad
- docs: documentación
- chore: tareas de mantenimiento

## Arquitectura de datos
- Hoja Proyectos: ID_Proyecto, Nombre, Lider, Empresa, Etapa, Estado, Impacto...
- Hoja Tareas: ID_Tarea, ID_Proyecto, Nombre_Tarea, Estado_Tarea, ID_Sprint...
- Hoja Sprints: ID_Sprint, ID_Proyecto, Nombre, Fecha_Inicio, Fecha_Fin
- Hoja Historial_Etapas: ID_Proyecto, Proyecto, Etapa_Anterior, Etapa_Nueva,
  Motivo, Fecha_Inicio, Fecha_Fin, Usuario, Timestamp
- Hoja Accesos_Rapidos: ID_Acceso, Email_Usuario, Titulo, URL, Categoria...

## Decisiones de arquitectura vigentes
- ADR-001: Progreso calculado desde sprint vigente, no campo manual
- ADR-002: Gestores ven solo sus iniciativas. Admins ven todo.
- ADR-003: Sin tareas automáticas. Planificación libre por sprint.
- ADR-004: Accesos rápidos en Sheets con fallback a localStorage.
- ADR-005: Historial_Etapas ya existe con 9 columnas confirmadas.