/**
 * ============================================================
 * MÓDULO DE REPORTES
 * ============================================================
 * Genera reportes ejecutivos consolidados desde el estado actual
 * de proyectos y tareas (snapshot).
 *
 * CAMBIOS:
 *   - generarReporteSnapshot()  → Excluye iniciativas en etapa
 *     "6 Iniciativa cerrada". Aplica filtro de "Estado de tareas"
 *     (reemplaza el filtro "Líder").
 *   - construirKPIs()           → Calcula:
 *       · TOTAL PROYECTOS: solo visibles (sin cerradas).
 *       · TOTAL EN CURSO: etapas 1–5 sin cerradas.
 *       · FINALIZADOS: solo etapa "6 Iniciativa cerrada".
 *   - construirMetadata()       → Registra filtro estadoTareasFiltro
 *     en lugar de liderFiltro.
 *   - obtenerLideresUnicos()    → Eliminado del flujo de reportes;
 *     reemplazado por obtenerEstadosTareasOpciones().
 *   - obtenerEstadosTareasOpciones() → NUEVA: devuelve opciones del
 *     filtro "Estado de tareas".
 *   - construirDetalleProyectos() / construirResumenSprints() →
 *     sin cambios.
 */

/**
 * Genera el reporte snapshot.
 * filtros.estadoTareasFiltro acepta: 'vigentes' | 'completadas' | '' (todas)
 */
function generarReporteSnapshot(filtros) {
  try {
    filtros = filtros || {};

    const proyectos = obtenerProyectosConAnalisis();
    const tareas    = obtenerTareas();

    // ============================================================
    // SPRINTS: cargar todos los sprints visibles al usuario
    // ============================================================
    let todosLosSprints = [];
    try {
      todosLosSprints = obtenerSprints('');
    } catch (e) {
      Logger.log('Advertencia reportes (sprints): ' + e.message);
    }

    // ============================================================
    // CAMBIO: Excluir iniciativas en etapa "6 Iniciativa cerrada"
    // ============================================================
    let proyectosFiltrados = proyectos.filter(p =>
      String(p[CONFIG.COL_ETAPA] || '').trim() !== CONFIG.ETAPA_CERRADA
    );

    if (filtros.empresaFiltro) {
      proyectosFiltrados = proyectosFiltrados.filter(p => p.Empresa === filtros.empresaFiltro);
    }
    if (filtros.soloAtrasados) {
      proyectosFiltrados = proyectosFiltrados.filter(p =>
        p.Estado_Comparacion === 'atrasado' || p.Etapa === 'Bloqueado'
      );
    }

    const idsProyectos    = new Set(proyectosFiltrados.map(p => p.ID_Proyecto));
    let tareasFiltradas   = tareas.filter(t => idsProyectos.has(t.ID_Proyecto));

    // ============================================================
    // FIX: Deduplicar sprints por ID_Sprint antes de procesar.
    // Si la hoja Sprints contiene filas repetidas (mismo ID_Sprint),
    // cada copia generaría un bloque duplicado en el reporte.
    // Se conserva únicamente la primera ocurrencia de cada ID_Sprint.
    // ============================================================
    const sprintsFiltrados = (function() {
      const vistos = new Set();
      return todosLosSprints.filter(s => {
        if (!idsProyectos.has(s.ID_Proyecto)) return false;
        const idSprint = String(s.ID_Sprint || '').trim();
        if (!idSprint || vistos.has(idSprint)) return false;
        vistos.add(idSprint);
        return true;
      });
    })();

    // ============================================================
    // NUEVO: Filtro "Estado de tareas" (reemplaza filtro "Líder")
    // Opciones: 'vigentes' → Pendiente + En Proceso
    //           'completadas' → Completada
    //           '' o 'todas' → sin filtro
    // ============================================================
    const estadoTareasFiltro = String(filtros.estadoTareasFiltro || '').trim();
    if (estadoTareasFiltro === 'vigentes') {
      tareasFiltradas = tareasFiltradas.filter(t =>
        t.Estado_Tarea === 'Pendiente' || t.Estado_Tarea === 'En Proceso'
      );
    } else if (estadoTareasFiltro === 'completadas') {
      tareasFiltradas = tareasFiltradas.filter(t => t.Estado_Tarea === 'Completada');
    }
    // '' / 'todas' → sin filtro adicional

    // ============================================================
    // KPIs: pasar también la lista completa de proyectos del usuario
    // (sin filtro de empresa/atrasados pero SÍ sin cerradas)
    // para calcular el contador de "Finalizados" (=cerradas)
    // ============================================================
    const proyectosSinCerradas = proyectos.filter(p =>
      String(p[CONFIG.COL_ETAPA] || '').trim() !== CONFIG.ETAPA_CERRADA
    );
    const proyectosCerradas = proyectos.filter(p =>
      String(p[CONFIG.COL_ETAPA] || '').trim() === CONFIG.ETAPA_CERRADA
    );

    return {
      metadata:             construirMetadata(filtros),
      kpis:                 construirKPIs(proyectosFiltrados, tareasFiltradas, proyectosCerradas),
      distribucionEmpresas: construirDistribucionEmpresas(proyectosFiltrados),
      atencion:             identificarProyectosCriticos(proyectosFiltrados, tareasFiltradas),
      detalleProyectos:     construirDetalleProyectos(proyectosFiltrados, tareasFiltradas, sprintsFiltrados),
      cargaPorPersona:      construirCargaPorPersona(proyectosFiltrados),
      observaciones:        generarObservacionesAutomaticas(proyectosFiltrados, tareasFiltradas)
    };
  } catch (error) {
    Logger.log('Error en generarReporteSnapshot: ' + error.message);
    throw new Error('No se pudo generar el reporte: ' + error.message);
  }
}

function construirMetadata(filtros) {
  const ahora = new Date();
  return {
    fechaCorte:       filtros.fechaCorte || Utilities.formatDate(ahora, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    fechaGeneracion:  Utilities.formatDate(ahora, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
    generadoPor:      Session.getActiveUser().getEmail() || 'usuario_anonimo',
    filtrosAplicados: {
      empresa:            filtros.empresaFiltro       || 'Todas',
      estadoTareas:       filtros.estadoTareasFiltro  || 'Todas',
      soloAtrasados:      !!filtros.soloAtrasados
    }
  };
}

/**
 * Construye los KPIs del reporte con las nuevas reglas:
 *   - TOTAL PROYECTOS  → proyectos visibles del gestor (sin cerradas).
 *   - TOTAL EN CURSO   → estados 1–5 (sin cerradas).
 *   - FINALIZADOS      → cantidad de iniciativas en "6 Iniciativa cerrada".
 *
 * @param {Array} proyectos         Proyectos filtrados (sin cerradas).
 * @param {Array} tareas            Tareas filtradas.
 * @param {Array} proyectosCerradas Proyectos en etapa "6 Iniciativa cerrada".
 */
function construirKPIs(proyectos, tareas, proyectosCerradas) {
  proyectosCerradas = proyectosCerradas || [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const tareasVencidas = tareas.filter(t => {
    if (t.Estado_Tarea === 'Completada') return false;
    if (!t.Fecha_Entrega) return false;
    return new Date(t.Fecha_Entrega) <= hoy;
  });
  const progresoGlobal = proyectos.length > 0
    ? Math.round(proyectos.reduce((sum, p) => sum + (Number(p.Progreso) || 0), 0) / proyectos.length)
    : 0;

  // TOTAL EN CURSO: estados 1–5 según Metodología OPI 2026 (excluyendo estado 6 que ya está fuera)
  const estadosEnCurso = [
    '1 DISCOVERY (Investigación)',
    '2 CONCEPT STUDIO (Conceptualización)',
    '3 PROJECT SETUP (Planificación)',
    '4 DELIVERY ENGINE (Implementación)',
    '5 LAUNCHPAD (G2M)'
  ];
  const proyectosEnCurso = proyectos.filter(p =>
    estadosEnCurso.includes(String(p.Etapa || '').trim()) &&
    !String(p.Etapa || '').toLowerCase().includes('bloqueado')
  ).length;

  return {
    // TOTAL PROYECTOS: solo los visibles (sin cerradas)
    totalProyectos:       proyectos.length,
    // TOTAL EN CURSO: estados 1–5
    proyectosActivos:     proyectosEnCurso,
    // FINALIZADOS: los cerrados (estado 6)
    proyectosFinalizados: proyectosCerradas.length,
    proyectosBloqueados:  proyectos.filter(p => p.Etapa && p.Etapa.toLowerCase().includes('bloqueado')).length,
    proyectosAtrasados:   proyectos.filter(p => p.Estado_Comparacion === 'atrasado').length,
    proyectosAdelantados: proyectos.filter(p => p.Estado_Comparacion === 'adelantado').length,
    totalTareas:          tareas.length,
    tareasPendientes:     tareas.filter(t => t.Estado_Tarea === 'Pendiente').length,
    tareasEnProceso:      tareas.filter(t => t.Estado_Tarea === 'En Proceso').length,
    tareasCompletadas:    tareas.filter(t => t.Estado_Tarea === 'Completada').length,
    tareasVencidas:       tareasVencidas.length,
    progresoGlobal:       progresoGlobal
  };
}

function identificarProyectosCriticos(proyectos, tareas) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return proyectos
    .map(p => {
      const tareasProyecto = tareas.filter(t => t.ID_Proyecto === p.ID_Proyecto);
      const tareasVencidas = tareasProyecto.filter(t => {
        if (t.Estado_Tarea === 'Completada') return false;
        if (!t.Fecha_Entrega) return false;
        return new Date(t.Fecha_Entrega) <= hoy;
      });
      return {
        ...p,
        tareasVencidas: tareasVencidas.length,
        totalTareas:    tareasProyecto.length
      };
    })
    .filter(p => p.Estado_Comparacion === 'atrasado' || p.Etapa === 'Bloqueado' || p.tareasVencidas > 0)
    .sort((a, b) => {
      if (a.Etapa === 'Bloqueado' && b.Etapa !== 'Bloqueado') return -1;
      if (b.Etapa === 'Bloqueado' && a.Etapa !== 'Bloqueado') return 1;
      return (a.Desviacion || 0) - (b.Desviacion || 0);
    });
}

/**
 * Construye el resumen de Sprints por proyecto.
 * Cada Sprint aparece exactamente una vez, agrupando sus tareas.
 */
function construirResumenSprints(tareasProyecto, sprintsProyecto) {
  // ============================================================
  // FIX: Deduplicar la lista de sprints por ID_Sprint antes de
  // construir el resumen. Esto elimina la causa raíz del problema
  // de registros duplicados cuando un Sprint aparece más de una
  // vez en la colección recibida (cualquiera sea el origen).
  // ============================================================
  if (sprintsProyecto && sprintsProyecto.length > 0) {
    const vistosResumen = new Set();
    sprintsProyecto = sprintsProyecto.filter(s => {
      const idSprint = String(s.ID_Sprint || '').trim();
      if (!idSprint || vistosResumen.has(idSprint)) return false;
      vistosResumen.add(idSprint);
      return true;
    });
  }

  if (!sprintsProyecto || sprintsProyecto.length === 0) {
    if (tareasProyecto.length === 0) return [];
    return [{
      ID_Sprint:   '—',
      Nombre:      'Sin Sprint asignado',
      Fecha_Inicio: '',
      Fecha_Fin:    '',
      tareas:      tareasProyecto,
      total:       tareasProyecto.length,
      completadas: tareasProyecto.filter(t => t.Estado_Tarea === 'Completada').length,
      enProceso:   tareasProyecto.filter(t => t.Estado_Tarea === 'En Proceso').length,
      pendientes:  tareasProyecto.filter(t => t.Estado_Tarea === 'Pendiente').length,
      pctAvance:   tareasProyecto.length > 0
        ? Math.round(tareasProyecto.reduce(function(sum, t) {
            return sum + (t.Estado_Tarea === 'Completada' ? 100 : t.Estado_Tarea === 'En Proceso' ? 50 : 0);
          }, 0) / tareasProyecto.length)
        : 0
    }];
  }

  const resumen = sprintsProyecto.map(sprint => {
    const tareasSprint = tareasProyecto.filter(
      t => String(t[CONFIG.COL_SPRINT] || '').trim() === sprint.ID_Sprint
    );
    const completadas = tareasSprint.filter(t => t.Estado_Tarea === 'Completada').length;
    const enProceso   = tareasSprint.filter(t => t.Estado_Tarea === 'En Proceso').length;
    const pendientes  = tareasSprint.filter(t => t.Estado_Tarea === 'Pendiente').length;

    return {
      ID_Sprint:    sprint.ID_Sprint,
      Nombre:       sprint.Nombre || sprint.ID_Sprint,
      Descripcion:  sprint.Descripcion || '',
      Fecha_Inicio: sprint.Fecha_Inicio || '',
      Fecha_Fin:    sprint.Fecha_Fin || '',
      tareas:       tareasSprint,
      total:        tareasSprint.length,
      completadas:  completadas,
      enProceso:    enProceso,
      pendientes:   pendientes,
      pctAvance:    tareasSprint.length > 0
        ? Math.round(tareasSprint.reduce(function(sum, t) {
            return sum + (t.Estado_Tarea === 'Completada' ? 100 : t.Estado_Tarea === 'En Proceso' ? 50 : 0);
          }, 0) / tareasSprint.length)
        : 0
    };
  });

  const idsSprintsConocidos = new Set(sprintsProyecto.map(s => s.ID_Sprint));
  const tareasSinSprint = tareasProyecto.filter(
    t => !idsSprintsConocidos.has(String(t[CONFIG.COL_SPRINT] || '').trim())
  );
  if (tareasSinSprint.length > 0) {
    resumen.push({
      ID_Sprint:   '—',
      Nombre:      'Sin Sprint asignado',
      Fecha_Inicio: '',
      Fecha_Fin:    '',
      tareas:      tareasSinSprint,
      total:       tareasSinSprint.length,
      completadas: tareasSinSprint.filter(t => t.Estado_Tarea === 'Completada').length,
      enProceso:   tareasSinSprint.filter(t => t.Estado_Tarea === 'En Proceso').length,
      pendientes:  tareasSinSprint.filter(t => t.Estado_Tarea === 'Pendiente').length,
      pctAvance:   tareasSinSprint.length > 0
        ? Math.round(tareasSinSprint.reduce(function(sum, t) {
            return sum + (t.Estado_Tarea === 'Completada' ? 100 : t.Estado_Tarea === 'En Proceso' ? 50 : 0);
          }, 0) / tareasSinSprint.length)
        : 0
    });
  }

  return resumen;
}

function construirDetalleProyectos(proyectos, tareas, sprints) {
  sprints = sprints || [];

  return proyectos.map(p => {
    const tareasProyecto = tareas.filter(t => t.ID_Proyecto === p.ID_Proyecto);

    // ============================================================
    // FIX: Deduplicar sprints del proyecto por ID_Sprint.
    // Capa defensiva adicional: aunque generarReporteSnapshot ya
    // deduplica, este filtro garantiza que construirResumenSprints
    // nunca reciba IDs repetidos independientemente del origen de
    // la lista de sprints.
    // ============================================================
    const sprintsProyectoRaw = sprints.filter(s => s.ID_Proyecto === p.ID_Proyecto);
    const vistosProyecto = new Set();
    const sprintsProyecto = sprintsProyectoRaw.filter(s => {
      const idSprint = String(s.ID_Sprint || '').trim();
      if (!idSprint || vistosProyecto.has(idSprint)) return false;
      vistosProyecto.add(idSprint);
      return true;
    });

    const resumenSprints  = construirResumenSprints(tareasProyecto, sprintsProyecto);

    return {
      ...p,
      Etapa:  p.Etapa  || '',
      Estado: p.Estado || '',
      tareas: tareasProyecto,
      sprints: resumenSprints,
      resumenTareas: {
        total:       tareasProyecto.length,
        pendientes:  tareasProyecto.filter(t => t.Estado_Tarea === 'Pendiente').length,
        enProceso:   tareasProyecto.filter(t => t.Estado_Tarea === 'En Proceso').length,
        completadas: tareasProyecto.filter(t => t.Estado_Tarea === 'Completada').length
      }
    };
  });
}

function construirCargaPorPersona(proyectos) {
  const mapa = {};
  proyectos.forEach(p => {
    const persona = (p.Lider || 'Sin asignar');
    if (!mapa[persona]) {
      mapa[persona] = { persona, total: 0, enCurso: 0, finalizados: 0, atrasados: 0, bloqueados: 0, sumaProgreso: 0 };
    }
    mapa[persona].total++;
    const estado = p.Etapa || '';
    if (estado === '5 LAUNCHPAD (G2M)') {
      mapa[persona].finalizados++;
    } else if (estado.toLowerCase().includes('bloqueado')) {
      mapa[persona].bloqueados++;
    } else {
      mapa[persona].enCurso++;
    }
    if (p.Estado_Comparacion === 'atrasado') mapa[persona].atrasados++;
    mapa[persona].sumaProgreso += (Number(p.Progreso) || 0);
  });

  return Object.values(mapa).map(c => ({
    persona:         c.persona,
    total:           c.total,
    enCurso:         c.enCurso,
    finalizados:     c.finalizados,
    atrasados:       c.atrasados,
    bloqueados:      c.bloqueados,
    progresoPromedio: c.total > 0 ? Math.round(c.sumaProgreso / c.total) : 0
  })).sort((a, b) => b.total - a.total);
}

function generarObservacionesAutomaticas(proyectos, tareas) {
  const observaciones = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const sinTareas = proyectos.filter(p =>
    p.Etapa !== '5 LAUNCHPAD (G2M)' && !tareas.some(t => t.ID_Proyecto === p.ID_Proyecto)
  );
  if (sinTareas.length > 0) {
    observaciones.push({
      tipo:  'warning',
      texto: `${sinTareas.length} proyecto(s) activo(s) no tienen tareas asignadas: ${sinTareas.map(p => p.Nombre).join(', ')}`
    });
  }

  const muyAtrasados = proyectos.filter(p => p.Desviacion !== null && p.Desviacion < -20);
  if (muyAtrasados.length > 0) {
    observaciones.push({
      tipo:  'danger',
      texto: `${muyAtrasados.length} proyecto(s) con atraso superior al 20%: ${muyAtrasados.map(p => p.Nombre).join(', ')}`
    });
  }

  if (observaciones.length === 0) {
    observaciones.push({
      tipo:  'success',
      texto: 'No se detectaron alertas críticas. Todos los indicadores están dentro de rangos normales.'
    });
  }
  return observaciones;
}

/**
 * NUEVO: Devuelve las opciones del filtro "Estado de tareas".
 * Reemplaza a obtenerLideresUnicos() en el flujo de reportes.
 */
function obtenerEstadosTareasOpciones() {
  return [
    { valor: 'vigentes',     etiqueta: 'Pendientes y en curso' },
    { valor: 'completadas',  etiqueta: 'Completadas' },
    { valor: 'todas',        etiqueta: 'Todas' }
  ];
}

/**
 * Mantenida por compatibilidad con otras partes del sistema que
 * puedan referenciarla (p.ej. el Dashboard).
 */
function obtenerLideresUnicos() {
  try {
    const proyectos = obtenerProyectos();
    return [...new Set(proyectos.map(p => p.Lider).filter(Boolean))].sort();
  } catch (error) {
    Logger.log('Error en obtenerLideresUnicos: ' + error.message);
    return [];
  }
}

function construirDistribucionEmpresas(proyectos) {
  return CONFIG.EMPRESAS.map(empresa => {
    const proys          = proyectos.filter(p => p.Empresa === empresa);
    const total          = proys.length;
    const activos        = proys.filter(p => p.Etapa !== '5 LAUNCHPAD (G2M)').length;
    const finalizados    = proys.filter(p => p.Etapa === '5 LAUNCHPAD (G2M)').length;
    const atrasados      = proys.filter(p => p.Estado_Comparacion === 'atrasado').length;
    const progresoPromedio = total > 0
      ? Math.round(proys.reduce((s, p) => s + (Number(p.Progreso) || 0), 0) / total)
      : 0;
    return { empresa, total, activos, finalizados, atrasados, progresoPromedio };
  }).filter(d => d.total > 0);
}

/* ============================================================
 * EXPORTACIÓN DE REPORTES CON COLUMNAS COMPLETAS + SPRINTS
 * ============================================================ */

function generarReporteExportacion(filtros) {
  try {
    const snapshot = generarReporteSnapshot(filtros);
    const detalles = snapshot.detalleProyectos;

    const encabezadosProyecto = [
      'ID_Proyecto',
      'Nombre',
      'Descripción',
      'Líder',
      'Empresa',
      'Startup',
      'Etapa',
      'Estado',
      'Impacto',
      'Progreso (%)',
      'Progreso Esperado (%)',
      'Desviación (%)',
      'Situación',
      'Fecha Inicio Etapa Actual',
      'Fecha Fin Etapa Actual',
      'Total Sprints',
      'Total Tareas',
      'Tareas Pendientes',
      'Tareas En Proceso',
      'Tareas Completadas'
    ];

    const filasProyecto = detalles.map(p => [
      p.ID_Proyecto || '',
      p.Nombre || '',
      p.Descripcion || '',
      p.Lider || '',
      p.Empresa || '',
      p.Startup || '',
      p.Etapa || '',
      p.Estado || '',
      p.Impacto || '',
      Number(p.Progreso) || 0,
      p.Progreso_Esperado !== null ? p.Progreso_Esperado : '',
      p.Desviacion !== null ? p.Desviacion : '',
      p.Estado_Comparacion || '',
      p.Fecha_Inicio || '',
      p.Fecha_Fin || '',
      (p.sprints || []).length,
      p.resumenTareas.total,
      p.resumenTareas.pendientes,
      p.resumenTareas.enProceso,
      p.resumenTareas.completadas
    ]);

    const separador = [['--- DETALLE DE SPRINTS ---']];
    const encabezadosSprints = [[
      'ID_Proyecto',
      'Nombre Proyecto',
      'ID_Sprint',
      'Nombre Sprint',
      'Descripción Sprint',
      'Fecha Inicio Sprint',
      'Fecha Fin Sprint',
      'Total Tareas Sprint',
      'Completadas',
      'En Proceso',
      'Pendientes',
      '% Avance Sprint'
    ]];

    const filasSprints = [];
    detalles.forEach(p => {
      (p.sprints || []).forEach(sprint => {
        filasSprints.push([
          p.ID_Proyecto || '',
          p.Nombre || '',
          sprint.ID_Sprint || '',
          sprint.Nombre || '',
          sprint.Descripcion || '',
          sprint.Fecha_Inicio || '',
          sprint.Fecha_Fin || '',
          sprint.total,
          sprint.completadas,
          sprint.enProceso,
          sprint.pendientes,
          sprint.pctAvance
        ]);
      });
    });

    return [
      encabezadosProyecto,
      ...filasProyecto,
      [],
      ...separador,
      ...encabezadosSprints,
      ...filasSprints
    ];
  } catch (error) {
    Logger.log('Error en generarReporteExportacion: ' + error.message);
    throw new Error('No se pudo generar el reporte de exportación: ' + error.message);
  }
}