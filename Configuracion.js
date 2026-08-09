/**
 * ============================================================
 * CONFIGURACIÓN GLOBAL DEL SISTEMA
 * ============================================================
 * Centraliza constantes para facilitar mantenimiento.
 * Cambia SPREADSHEET_ID por el ID de tu Google Sheet.
 *
 * CAMBIOS (Metodología OPI 2026):
 *   - SHEETS.SPRINTS → NUEVA hoja para gestión de Sprints
 *   - COL_SPRINT     → NUEVA columna en Tareas para asociar Sprint
 *   - SPRINT_DEFECTO → nombre por defecto del primer Sprint
 *   - ESTADOS_GESTION → eliminado "6 Iniciativa cerrada" (ahora es Etapa)
 *   - ESTADOS_PROYECTO → etapas actualizadas a metodología OPI 2026
 *   - ETAPA_CERRADA  → constante para la etapa de cierre
 *   - TAREAS_POR_ETAPA → actualizado con entregables OPI 2026
 */

const CONFIG = {
  SPREADSHEET_ID: '10QQpYyy-amTzU-3AqvOMZZmUBZtByEPSGUq4y2ddWs0',

  SHEETS: {
    PROYECTOS: 'Proyectos',
    TAREAS: 'Tareas',
    CONFIGURACION: 'Configuración',

    // ============================================================
    // REQ 3 / REQ 4: Historial de etapas
    // ============================================================
    HISTORIAL_ETAPAS: 'Historial_Etapas',

    // ============================================================
    // SPRINTS: Hoja maestra de Sprints de trabajo
    // ============================================================
    // Columnas: ID_Sprint | Nombre | Descripcion | Fecha_Inicio | Fecha_Fin | ID_Proyecto
    // Se crea automáticamente al ejecutar migrarEsquemaProyectos().
    SPRINTS: 'Sprints'
  },

  // ESTADOS_PROYECTO representa las ETAPAS (fases) del proceso de
  // aceleración según la Metodología OPI 2026, incluyendo la etapa de cierre.
  // ============================================================
  // "6 Iniciativa cerrada" es una ETAPA, no un Estado.
  // Solo los administradores pueden asignar esta etapa.
  // Las iniciativas en esta etapa se ocultan a usuarios normales.
  // ============================================================
  ESTADOS_PROYECTO: [
    '1 DISCOVERY (Investigación)',
    '2 CONCEPT STUDIO (Conceptualización)',
    '3 PROJECT SETUP (Planificación)',
    '4 DELIVERY ENGINE (Implementación)',
    '5 LAUNCHPAD (G2M)',
    '6 Iniciativa cerrada'
  ],

  ESTADOS_TAREA: ['Pendiente', 'En Proceso', 'Completada'],
  PRIORIDADES: ['Alta', 'Media', 'Baja'],
  EMPRESAS: ['Davivienda', 'Seguros Bolívar', 'Constructora Bolívar'],

  // ============================================================
  // REQ 1: Impacto de la iniciativa (campo obligatorio)
  // ============================================================
  IMPACTOS: ['Ingresos', 'Eficiencia', 'Experiencia'],

  // ============================================================
  // REQ 2: Estado de gestión de la iniciativa (campo nuevo)
  // CAMBIO: "6 Iniciativa cerrada" fue eliminado de aquí y
  //         promovido a ETAPA. Los estados de gestión son solo
  //         los estados operativos de la iniciativa.
  // ============================================================
  ESTADOS_GESTION: ['Activo', 'En Pausa', 'Finalizado'],
  ESTADO_GESTION_DEFECTO: 'Activo',

  // ============================================================
  // ETAPA_CERRADA: constante para la etapa de iniciativa cerrada.
  // Reemplaza a ESTADO_CERRADA (que era un estado de gestión).
  // ============================================================
  ETAPA_CERRADA: '6 Iniciativa cerrada',

  // Prefijos para IDs únicos
  PREFIJO_PROYECTO: 'INI',
  PREFIJO_TAREA: 'TSK',
  PREFIJO_SPRINT: 'SPR',   // ← NUEVO: prefijo para IDs de Sprint

  // Configuración de correos
  ASUNTO_ALERTA: '[VP de Innovación] Alerta de actividad incompleta',

  // URL pública de la Web App
  WEBAPP_URL: 'https://script.google.com/a/macros/segurosbolivar.com/s/AKfycbxhRaET11HQpL84En_pVEPkZSOo-k93ibG06_yL0AwKoqRnEyvlG4pjC1ku6VAvkB4Gww/exec',

  // ============================================================
  // ESTRUCTURA DOCUMENTAL EN GOOGLE DRIVE
  // ============================================================
  DRIVE_CARPETA_RAIZ_ID: '1RF40xbqDlitsb_0KjhD-KRJ8UNta_0-i',

  SUBCARPETAS_PROYECTO: [
    'Documentos aliado',
    'Documentos legales',
    'Documentos comerciales',
    'Documentos riesgos'
  ],

  COL_CARPETA_URL: 'Carpeta_URL',
  COL_ALIADO_URL: 'Aliado_URL',

  // ============================================================
  // REQ 2: Columna propietario del proyecto
  // ============================================================
  COL_PROPIETARIO: 'Propietario',

  // ============================================================
  // INTEGRACIÓN PLANTILLA XLSX (OPCIONAL)
  // ============================================================
  PLANTILLA_XLSX_ID: '',
  COL_PLANTILLA_ID: 'Plantilla_ID',

  // ============================================================
  // REQ 1 / REQ 2: nombres de las nuevas columnas en "Proyectos"
  // ============================================================
  COL_IMPACTO: 'Impacto',
  COL_ETAPA: 'Etapa',
  COL_ESTADO: 'Estado',

  // ============================================================
  // SPRINTS: columnas en la hoja Tareas relacionadas con el Sprint
  // ============================================================
  COL_SPRINT: 'ID_Sprint',
  COL_SPRINT_NOMBRE:      'Nombre_Sprint',
  COL_SPRINT_FECHA_INICIO:'Fecha_Inicio_Sprint',
  COL_SPRINT_FECHA_FIN:   'Fecha_Fin_Sprint',

  // ============================================================
  // SOLUCIÓN 1: CATÁLOGO DE TAREAS AUTOMÁTICAS POR ETAPA
  // Actualizado según Metodología OPI 2026
  // ============================================================
  TAREAS_POR_ETAPA: {
    // Fase 1: DISCOVERY (Investigación) — 1 Sprint, 2 semanas
    '1': [
      'Mapeo de Tendencias',
      'Tech Scouting',
      'Benchmarking',
      'Análisis de nuevos modelos de negocio',
      'Insight Report (Análisis, Conclusiones y Recomendaciones)'
    ],
    // Fase 2: CONCEPT STUDIO (Conceptualización) — 2 Sprints, 5 semanas
    // Bloque A – Oferta de Valor (2 semanas): deseabilidad del usuario
    // Bloque B – Modelo Operativo (3 semanas): factibilidad del back
    '2': [
      'Definición del Concepto',
      'Journey Map & JTBD (Jobs to be Done)',
      'Prototipo',
      'Service Blueprint',
      'Operating Model Canvas'
    ],
    // Fase 3: PROJECT SETUP (Planificación) — 2 Sprints, 5 semanas
    // Bloque A – Business Case (2 semanas)
    // Bloque B – Inception & Faseo (3 semanas)
    '3': [
      'Definición de Inversión',
      'Cálculo de Retorno (ROI)',
      'Análisis de Viabilidad',
      'Definición de Alcance',
      'Identificación de Insumos',
      'Asignación de Recursos',
      'Construcción de Roadmap'
    ],
    // Fase 4: DELIVERY ENGINE (Implementación) — 6 Sprints, 20 semanas
    '4': [
      'Desarrollo Solución Tech',
      'Contract & Risk',
      'Desarrollo del Operating Model Canvas'
    ],
    // Fase 5: LAUNCHPAD (G2M) — 6 Sprints, 18 semanas
    // Bloque A – Beta Test (12 semanas)
    // Bloque B – Ajuste & Preparación G2M (3 semanas)
    // Bloque C – Roll out & Transición (3 semanas)
    '5': [
      'Setup del Piloto',
      'Ejecución con grupo controlado',
      'Medición de resultados',
      'Análisis y Ajustes',
      'Estrategia G2M',
      'Fastrack',
      'Escalamiento masivo (Roll out)',
      'Monitoreo constante',
      'Handover a operación comercial (BAU)'
    ]
    // Nota: la etapa "6 Iniciativa cerrada" no tiene tareas automáticas.
  },

  // ============================================================
  // CONTROL DE ACCESO: Administradores del Sistema
  // ============================================================
  ADMINISTRADORES: []
};