/**
 * ============================================================
 * CÓDIGO PRINCIPAL DEL SERVIDOR
 * ============================================================
 *
 * CAMBIOS EN ESTA VERSIÓN (Metodología OPI 2026):
 *   - Etapas actualizadas: 1 DISCOVERY, 2 CONCEPT STUDIO, 3 PROJECT SETUP,
 *     4 DELIVERY ENGINE, 5 LAUNCHPAD (G2M), 6 Iniciativa cerrada (sin cambios).
 *   - obtenerProyectos()            → filtra etapa "6 Iniciativa cerrada" para gestores;
 *                                     admins ven todo.
 *   - cambiarEtapaProyecto()        → acepta "6 Iniciativa cerrada" como etapa válida (solo admin);
 *   - cambiarEstadoGestionProyecto()→ eliminado el manejo especial de ESTADO_CERRADA.
 *   - crearProyecto()               → etapa inicial por defecto actualizada a OPI 2026.
 *   - _calcularEstadisticas()       → referencias de etapas actualizadas.
 *   - construirKPIs() en Reportes   → estadosEnCurso actualizados a OPI 2026.
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Sistema de gestión de Iniciativas - VP Innovación')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* ============================================================
 * USUARIO AUTENTICADO — expuesto al cliente
 * ============================================================ */

function obtenerInfoUsuario() {
  try {
    const email = Session.getActiveUser().getEmail() || '';
    const inicial = email ? email.charAt(0).toUpperCase() : '?';
    return { email: email, inicial: inicial };
  } catch (e) {
    Logger.log('obtenerInfoUsuario: ' + e.message);
    return { email: '', inicial: '?' };
  }
}

/* ============================================================
 * OPERACIONES: PROYECTOS
 * ============================================================ */

function obtenerProyectos() {
  try {
    const emailUsuario = obtenerEmailUsuario();
    const esAdmin = esAdministrador();

    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.PROYECTOS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return [];

    const headers = data[0];

    return data.slice(1)
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => {
          if (row[i] instanceof Date) {
            obj[h] = Utilities.formatDate(row[i], Session.getScriptTimeZone(), 'yyyy-MM-dd');
          } else {
            obj[h] = row[i];
          }
        });
        return obj;
      })
      .filter(p => {
        // ============================================================
        // CAMBIO: La etapa "6 Iniciativa cerrada" solo la ven los administradores
        // ============================================================
        const etapaActual = String(p[CONFIG.COL_ETAPA] || '').trim();
        if (etapaActual === CONFIG.ETAPA_CERRADA && !esAdmin) {
          return false;
        }
        // ────────────────────────────────────────────────────────────

        if (esAdmin) return true;
        if (!emailUsuario) return true;
        const propietario = String(p[CONFIG.COL_PROPIETARIO] || '').trim().toLowerCase();
        return propietario === emailUsuario;
      });
  } catch (error) {
    Logger.log('Error en obtenerProyectos: ' + error.message);
    throw new Error('No se pudieron cargar los proyectos: ' + error.message);
  }
}

function _obtenerTodosLosProyectos() {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                              .getSheetByName(CONFIG.SHEETS.PROYECTOS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (row[i] instanceof Date)
        ? Utilities.formatDate(row[i], Session.getScriptTimeZone(), 'yyyy-MM-dd')
        : row[i];
    });
    return obj;
  });
}

function _obtenerTodasLasTareas() {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                              .getSheetByName(CONFIG.SHEETS.TAREAS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (row[i] instanceof Date)
        ? Utilities.formatDate(row[i], Session.getScriptTimeZone(), 'yyyy-MM-dd')
        : row[i];
    });
    return obj;
  });
}

function _calcularEstadisticas(proyectos, tareas) {
  return {
    totalProyectos: proyectos.length,
    proyectosActivos: proyectos.filter(p =>
      p.Etapa && p.Etapa !== '5 LAUNCHPAD (G2M)' &&
      p.Etapa !== CONFIG.ETAPA_CERRADA &&
      !p.Etapa.toLowerCase().includes('bloqueado')).length,
    proyectosFinalizados: proyectos.filter(p => p.Etapa === '5 LAUNCHPAD (G2M)').length,
    proyectosCerrados: proyectos.filter(p => p.Etapa === CONFIG.ETAPA_CERRADA).length,
    proyectosBloqueados: proyectos.filter(p =>
      p.Etapa && p.Etapa.toLowerCase().includes('bloqueado')).length,

    totalTareas: tareas.length,
    tareasPendientes:  tareas.filter(t => t.Estado_Tarea === 'Pendiente').length,
    tareasEnProceso:   tareas.filter(t => t.Estado_Tarea === 'En Proceso').length,
    tareasCompletadas: tareas.filter(t => t.Estado_Tarea === 'Completada').length,

    distribucionEstados: CONFIG.ESTADOS_PROYECTO.filter(e => e !== CONFIG.ETAPA_CERRADA).map(estado => ({
      estado,
      cantidad: proyectos.filter(p => p.Etapa === estado).length
    })),

    tareasPorPrioridad: CONFIG.PRIORIDADES.map(pr => ({
      prioridad: pr,
      cantidad: tareas.filter(t => t.Prioridad === pr).length
    })),

    distribucionEmpresas: CONFIG.EMPRESAS.map(empresa => ({
      empresa,
      cantidad: proyectos.filter(p => p.Empresa === empresa).length
    }))
  };
}

function obtenerEstadisticas() {
  try {
    const proyectos = obtenerProyectos();
    const tareas    = obtenerTareas();
    return _calcularEstadisticas(proyectos, tareas);
  } catch (error) {
    Logger.log('Error en obtenerEstadisticas: ' + error.message);
    throw new Error(error.message);
  }
}

function obtenerEstadisticasGlobales() {
  try {
    const proyectos = _obtenerTodosLosProyectos();
    const tareas    = _obtenerTodasLasTareas();
    return _calcularEstadisticas(proyectos, tareas);
  } catch (error) {
    Logger.log('Error en obtenerEstadisticasGlobales: ' + error.message);
    throw new Error(error.message);
  }
}

function crearProyecto(proyecto) {
  try {
    if (!proyecto.Nombre || !proyecto.Lider) {
      throw new Error('Nombre y Líder son campos obligatorios.');
    }
    if (!proyecto.Empresa) {
      throw new Error('Debe seleccionar una empresa.');
    }
    if (!CONFIG.EMPRESAS.includes(proyecto.Empresa)) {
      throw new Error('Empresa no válida: ' + proyecto.Empresa);
    }

    if (!proyecto.Impacto) {
      throw new Error('Debe seleccionar el Impacto de la iniciativa.');
    }
    if (!CONFIG.IMPACTOS.includes(proyecto.Impacto)) {
      throw new Error('Impacto no válido: ' + proyecto.Impacto);
    }

    const estadoGestion = proyecto.Estado && CONFIG.ESTADOS_GESTION.includes(proyecto.Estado)
      ? proyecto.Estado
      : CONFIG.ESTADO_GESTION_DEFECTO;

    const etapaInicial = proyecto.Etapa || '1 DISCOVERY (Investigación)';
    const fechaInicioEtapa = proyecto.Fecha_Inicio || '';
    const fechaFinEtapa    = proyecto.Fecha_Fin || '';

    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.PROYECTOS);
    const nuevoId = generarIdUnico(CONFIG.PREFIJO_PROYECTO, sheet);

    const emailPropietario = obtenerEmailUsuario();

    let carpetaUrl = '';
    let carpetaId  = '';
    try {
      const carpeta = crearEstructuraCarpetasProyecto(proyecto.Nombre);
      carpetaUrl = carpeta.url;
      carpetaId  = carpeta.id;
    } catch (driveError) {
      Logger.log('Advertencia en crearProyecto (Drive): ' + driveError.message);
    }

    const nuevaFila = [
      nuevoId,
      proyecto.Nombre,
      proyecto.Descripcion || '',
      proyecto.Lider,
      proyecto.Empresa,
      proyecto.Startup || '',
      fechaInicioEtapa,
      fechaFinEtapa,
      etapaInicial,
      proyecto.Progreso || 0,
      ''
    ];
    sheet.appendRow(nuevaFila);

    const filaInsertada = sheet.getLastRow();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    let colCarpeta = headers.indexOf(CONFIG.COL_CARPETA_URL);
    if (colCarpeta === -1) {
      colCarpeta = headers.length;
      sheet.getRange(1, colCarpeta + 1).setValue(CONFIG.COL_CARPETA_URL);
    }
    if (carpetaUrl) {
      sheet.getRange(filaInsertada, colCarpeta + 1).setValue(carpetaUrl);
    }

    const aliadoUrl = String(proyecto.Aliado_URL || '').trim();
    if (aliadoUrl) {
      const headersAliado = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      let colAliado = headersAliado.indexOf(CONFIG.COL_ALIADO_URL);
      if (colAliado === -1) {
        colAliado = headersAliado.length;
        sheet.getRange(1, colAliado + 1).setValue(CONFIG.COL_ALIADO_URL);
      }
      sheet.getRange(filaInsertada, colAliado + 1).setValue(aliadoUrl);
    }

    if (emailPropietario) {
      const headersNew = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      let colProp = headersNew.indexOf(CONFIG.COL_PROPIETARIO);
      if (colProp === -1) {
        colProp = headersNew.length;
        sheet.getRange(1, colProp + 1).setValue(CONFIG.COL_PROPIETARIO);
      }
      sheet.getRange(filaInsertada, colProp + 1).setValue(emailPropietario);
    }

    let plantillaId  = '';
    let plantillaUrl = '';
    if (CONFIG.PLANTILLA_XLSX_ID && String(CONFIG.PLANTILLA_XLSX_ID).trim()) {
      try {
        const plantilla = crearPlantillaProyecto(proyecto.Nombre, carpetaId);
        plantillaId  = plantilla.id;
        plantillaUrl = plantilla.url;

        const headersXlsx = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        let colPlantilla = headersXlsx.indexOf(CONFIG.COL_PLANTILLA_ID);
        if (colPlantilla === -1) {
          colPlantilla = headersXlsx.length;
          sheet.getRange(1, colPlantilla + 1).setValue(CONFIG.COL_PLANTILLA_ID);
        }
        sheet.getRange(filaInsertada, colPlantilla + 1).setValue(plantillaId);
      } catch (plantillaError) {
        Logger.log('Advertencia en crearProyecto (plantilla XLSX): ' + plantillaError.message);
      }
    }

    const colImpacto = _asegurarColumnaProyectos(sheet, CONFIG.COL_IMPACTO);
    sheet.getRange(filaInsertada, colImpacto + 1).setValue(proyecto.Impacto);

    const colEstadoGestion = _asegurarColumnaProyectos(sheet, CONFIG.COL_ESTADO);
    sheet.getRange(filaInsertada, colEstadoGestion + 1).setValue(estadoGestion);

    try {
      _registrarHistorialEtapa({
        ID_Proyecto:    nuevoId,
        Etapa_Anterior: '',
        Etapa_Nueva:    etapaInicial,
        Motivo:         'Creación de la iniciativa',
        Fecha_Inicio:   fechaInicioEtapa,
        Fecha_Fin:      fechaFinEtapa
      });
    } catch (histError) {
      Logger.log('Advertencia en crearProyecto (historial de etapa): ' + histError.message);
    }

    // ============================================================
    // SPRINTS: crear Sprint inicial del proyecto automáticamente.
    // ============================================================
    let sprintInicialId = '';
    let sprintInicialNombre = '';
    let sprintInicialFechaFin = fechaFinEtapa;
    try {
      const nombreSprintInicial = String(proyecto.NombreSprintInicial || '').trim() || 'Sprint 1';
      const sprintResult = crearSprint({
        ID_Proyecto:  nuevoId,
        Nombre:       nombreSprintInicial,
        Descripcion:  'Sprint inicial del proyecto',
        Fecha_Inicio: fechaInicioEtapa,
        Fecha_Fin:    fechaFinEtapa
      });
      sprintInicialId      = sprintResult.id || '';
      sprintInicialNombre  = nombreSprintInicial;
    } catch (sprintError) {
      Logger.log('Advertencia en crearProyecto (sprint inicial): ' + sprintError.message);
    }

    try {
      _crearTareasAutomaticasProyecto({
        ID_Proyecto:       nuevoId,
        etapaInicial:      etapaInicial,
        propietario:       emailPropietario,
        fechaFinEtapa:     sprintInicialFechaFin,
        sprintId:          sprintInicialId,
        sprintNombre:      sprintInicialNombre,
        sprintFechaInicio: fechaInicioEtapa,
        sprintFechaFin:    sprintInicialFechaFin
      });
    } catch (tareasError) {
      Logger.log('Advertencia en crearProyecto (tareas automáticas): ' + tareasError.message);
    }

    return {
      success: true,
      id: nuevoId,
      carpetaUrl: carpetaUrl,
      plantillaUrl: plantillaUrl,
      mensaje: carpetaUrl
        ? 'Proyecto creado correctamente. Carpeta de Drive generada.'
        : 'Proyecto creado, pero no se pudo crear la carpeta en Drive. Verifica los permisos.'
    };
  } catch (error) {
    Logger.log('Error en crearProyecto: ' + error.message);
    throw new Error(error.message);
  }
}

function actualizarProyecto(datos) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.PROYECTOS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const colIndex = headers.indexOf(datos.campo);
    if (colIndex === -1) throw new Error('Campo no válido: ' + datos.campo);
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === datos.ID_Proyecto) {
        sheet.getRange(i + 1, colIndex + 1).setValue(datos.valor);
        return { success: true, mensaje: 'Proyecto actualizado.' };
      }
    }

    throw new Error('Proyecto no encontrado: ' + datos.ID_Proyecto);
  } catch (error) {
    Logger.log('Error en actualizarProyecto: ' + error.message);
    throw new Error(error.message);
  }
}

function eliminarProyecto(idProyecto) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.PROYECTOS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === idProyecto) {
        sheet.deleteRow(i + 1);
        return { success: true, mensaje: 'Proyecto eliminado.' };
      }
    }
    throw new Error('Proyecto no encontrado.');
  } catch (error) {
    Logger.log('Error en eliminarProyecto: ' + error.message);
    throw new Error(error.message);
  }
}

function cambiarEstadoProyectoConComentario(datos) {
  try {
    if (!datos.comentario || datos.comentario.trim().length < 5) {
      throw new Error('Debes ingresar un comentario de al menos 5 caracteres al cambiar el estado.');
    }
    if (!CONFIG.ESTADOS_PROYECTO.includes(datos.nuevoEstado)) {
      throw new Error('Estado no válido: ' + datos.nuevoEstado);
    }

    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.PROYECTOS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const colEstado = headers.indexOf(CONFIG.COL_ETAPA);
    let colComentarios = headers.indexOf('Comentarios');
    if (colEstado === -1) throw new Error('Columna Etapa no encontrada en Iniciativas.');
    if (colComentarios === -1) {
      colComentarios = headers.length;
      sheet.getRange(1, colComentarios + 1).setValue('Comentarios');
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === datos.ID_Proyecto) {
        const estadoAnterior = data[i][colEstado];
        if (estadoAnterior === datos.nuevoEstado) {
          throw new Error('El proyecto ya está en ese estado.');
        }

        const usuario = Session.getActiveUser().getEmail() || 'usuario_anonimo';
        const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
        const entradaHistorial = '[' + timestamp + '] ' + usuario + ': ' + estadoAnterior + ' → ' + datos.nuevoEstado + '. ' + datos.comentario.trim();

        const comentariosPrevios = data[i][colComentarios] || '';
        const nuevosComentarios = comentariosPrevios ? entradaHistorial + '\n' + comentariosPrevios : entradaHistorial;

        sheet.getRange(i + 1, colEstado + 1).setValue(datos.nuevoEstado);
        sheet.getRange(i + 1, colComentarios + 1).setValue(nuevosComentarios);

        return {
          success: true,
          mensaje: 'Estado del proyecto cambiado: ' + estadoAnterior + ' → ' + datos.nuevoEstado
        };
      }
    }
    throw new Error('Proyecto no encontrado: ' + datos.ID_Proyecto);
  } catch (error) {
    Logger.log('Error en cambiarEstadoProyectoConComentario: ' + error.message);
    throw new Error(error.message);
  }
}

/* ============================================================
 * REQ 3 / REQ 4: CAMBIO DE ETAPA CON HISTORIAL Y FECHAS PROPIAS
 * ============================================================ */

function cambiarEtapaProyecto(datos) {
  try {
    if (!datos || !datos.ID_Proyecto) {
      throw new Error('Falta el identificador del proyecto.');
    }
    if (!datos.motivo || datos.motivo.trim().length < 5) {
      throw new Error('Debes ingresar un motivo de al menos 5 caracteres.');
    }
    if (!CONFIG.ESTADOS_PROYECTO.includes(datos.nuevaEtapa)) {
      throw new Error('Etapa no válida: ' + datos.nuevaEtapa);
    }

    // ============================================================
    // CAMBIO: Sólo administradores pueden asignar la etapa "6 Iniciativa cerrada"
    // ============================================================
    if (datos.nuevaEtapa === CONFIG.ETAPA_CERRADA && !esAdministrador()) {
      throw new Error(
        'No tienes permisos para cerrar iniciativas. ' +
        'Solo los administradores del sistema pueden asignar la etapa "6 Iniciativa cerrada".'
      );
    }
    // ────────────────────────────────────────────────────────────
    const fechaFin = String(datos.fechaFin || '').trim();
    if (!fechaFin) {
      throw new Error('Debes indicar la fecha final de la nueva etapa.');
    }

    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.PROYECTOS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const colEtapa       = headers.indexOf(CONFIG.COL_ETAPA);
    const colFechaInicio = headers.indexOf('Fecha_Inicio');
    const colFechaFin    = headers.indexOf('Fecha_Fin');
    let   colComentarios = headers.indexOf('Comentarios');
    if (colEtapa === -1)       throw new Error('Columna Etapa no encontrada en Iniciativas.');
    if (colFechaInicio === -1) throw new Error('Columna Fecha_Inicio no encontrada en Iniciativas.');
    if (colFechaFin === -1)    throw new Error('Columna Fecha_Fin no encontrada en Iniciativas.');
    if (colComentarios === -1) {
      colComentarios = headers.length;
      sheet.getRange(1, colComentarios + 1).setValue('Comentarios');
    }

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaInicioNueva = Utilities.formatDate(manana, Session.getScriptTimeZone(), 'yyyy-MM-dd');

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === datos.ID_Proyecto) {
        const etapaAnterior = data[i][colEtapa];
        if (etapaAnterior === datos.nuevaEtapa) {
          throw new Error('La iniciativa ya está en esa etapa.');
        }

        const usuario   = Session.getActiveUser().getEmail() || 'usuario_anonimo';
        const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
        const entradaHistorial = '[' + timestamp + '] ' + usuario + ' (etapa): ' +
          etapaAnterior + ' → ' + datos.nuevaEtapa + '. ' + datos.motivo.trim();

        const comentariosPrevios = data[i][colComentarios] || '';
        const nuevosComentarios  = comentariosPrevios
          ? entradaHistorial + '\n' + comentariosPrevios
          : entradaHistorial;

        sheet.getRange(i + 1, colEtapa + 1).setValue(datos.nuevaEtapa);
        sheet.getRange(i + 1, colFechaInicio + 1).setValue(fechaInicioNueva);
        sheet.getRange(i + 1, colFechaFin + 1).setValue(fechaFin);
        sheet.getRange(i + 1, colComentarios + 1).setValue(nuevosComentarios);

        _registrarHistorialEtapa({
          ID_Proyecto:    datos.ID_Proyecto,
          Etapa_Anterior: etapaAnterior,
          Etapa_Nueva:    datos.nuevaEtapa,
          Motivo:         datos.motivo.trim(),
          Fecha_Inicio:   fechaInicioNueva,
          Fecha_Fin:      fechaFin
        });

        let sprintNuevaEtapaId = '';
        try {
          const nombreSprint = _generarNombreSprintEtapa(datos.ID_Proyecto, datos.nuevaEtapa);
          const sprintResult = crearSprint({
            ID_Proyecto:  datos.ID_Proyecto,
            Nombre:       nombreSprint,
            Descripcion:  'Sprint para etapa: ' + datos.nuevaEtapa,
            Fecha_Inicio: fechaInicioNueva,
            Fecha_Fin:    fechaFin
          });
          sprintNuevaEtapaId = sprintResult.id || '';
        } catch (sprintError) {
          Logger.log('Advertencia en cambiarEtapaProyecto (sprint): ' + sprintError.message);
        }

        try {
          const emailPropietario = String(data[i][headers.indexOf(CONFIG.COL_PROPIETARIO)] || '').trim().toLowerCase();
          let sprintNuevaEtapaNombre = '';
          let sprintNuevaEtapaFechaFin = fechaFin;
          try {
            const sprintsExistentes = obtenerSprints(datos.ID_Proyecto);
            const sprintReciente = sprintsExistentes.find(s => s.ID_Sprint === sprintNuevaEtapaId);
            if (sprintReciente) {
              sprintNuevaEtapaNombre   = sprintReciente.Nombre || '';
              sprintNuevaEtapaFechaFin = sprintReciente.Fecha_Fin || fechaFin;
            }
          } catch (e) {
            Logger.log('No se pudo obtener info del nuevo sprint de etapa: ' + e.message);
          }
          _crearTareasAutomaticasProyecto({
            ID_Proyecto:       datos.ID_Proyecto,
            etapaInicial:      datos.nuevaEtapa,
            propietario:       emailPropietario,
            fechaFinEtapa:     sprintNuevaEtapaFechaFin,
            sprintId:          sprintNuevaEtapaId,
            sprintNombre:      sprintNuevaEtapaNombre,
            sprintFechaInicio: fechaInicioNueva,
            sprintFechaFin:    sprintNuevaEtapaFechaFin
          });
        } catch (tareasError) {
          Logger.log('Advertencia en cambiarEtapaProyecto (tareas automáticas): ' + tareasError.message);
        }

        try {
          _actualizarFechasTareasEtapa(datos.ID_Proyecto, datos.nuevaEtapa, fechaFin);
        } catch (fechasError) {
          Logger.log('Advertencia en cambiarEtapaProyecto (actualizarFechas): ' + fechasError.message);
        }

        return {
          success: true,
          mensaje: 'Etapa cambiada: ' + etapaAnterior + ' → ' + datos.nuevaEtapa
        };
      }
    }
    throw new Error('Proyecto no encontrado: ' + datos.ID_Proyecto);
  } catch (error) {
    Logger.log('Error en cambiarEtapaProyecto: ' + error.message);
    throw new Error(error.message);
  }
}

/* ============================================================
 * REQ 5 / NUEVO: CAMBIO DE ESTADO (GESTIÓN) CON MOTIVO
 * ============================================================
 *
 * CAMBIO:
 *   - Acepta "6 Iniciativa cerrada" como estado válido.
 *   - Si el estado ACTUAL es "Finalizado" o "6 Iniciativa cerrada",
 *     solo los administradores pueden modificarlo.
 */

function cambiarEstadoGestionProyecto(datos) {
  try {
    if (!datos || !datos.ID_Proyecto) {
      throw new Error('Falta el identificador del proyecto.');
    }
    if (!datos.motivo || datos.motivo.trim().length < 5) {
      throw new Error('Debes ingresar un motivo de al menos 5 caracteres.');
    }
    if (!CONFIG.ESTADOS_GESTION.includes(datos.nuevoEstado)) {
      throw new Error('Estado (gestión) no válido: ' + datos.nuevoEstado);
    }

    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.PROYECTOS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const colEstado = _asegurarColumnaProyectos(sheet, CONFIG.COL_ESTADO);
    let colComentarios = headers.indexOf('Comentarios');
    if (colComentarios === -1) {
      colComentarios = headers.length;
      sheet.getRange(1, colComentarios + 1).setValue('Comentarios');
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === datos.ID_Proyecto) {
        const estadoAnterior = data[i][colEstado] || CONFIG.ESTADO_GESTION_DEFECTO;

        // ============================================================
        // RESTRICCIÓN: Solo admins modifican proyectos en estado Finalizado
        // ============================================================
        if (estadoAnterior === 'Finalizado') {
          if (!esAdministrador()) {
            throw new Error(
              'No tienes permisos para modificar el estado de un proyecto Finalizado. ' +
              'Solo los administradores del sistema pueden realizar este cambio.'
            );
          }
        }
        // ────────────────────────────────────────────────────────────

        if (estadoAnterior === datos.nuevoEstado) {
          throw new Error('El proyecto ya está en ese estado.');
        }

        const usuario   = Session.getActiveUser().getEmail() || 'usuario_anonimo';
        const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
        const entradaHistorial = '[' + timestamp + '] ' + usuario + ' (estado): ' +
          estadoAnterior + ' → ' + datos.nuevoEstado + '. ' + datos.motivo.trim();

        // Re-leer headers actualizados tras _asegurarColumnaProyectos
        const headersActuales = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const colComentariosActual = headersActuales.indexOf('Comentarios');
        const comentariosPrevios = colComentariosActual !== -1 ? (data[i][colComentariosActual] || '') : '';
        const nuevosComentarios  = comentariosPrevios
          ? entradaHistorial + '\n' + comentariosPrevios
          : entradaHistorial;

        sheet.getRange(i + 1, colEstado + 1).setValue(datos.nuevoEstado);
        if (colComentariosActual !== -1) {
          sheet.getRange(i + 1, colComentariosActual + 1).setValue(nuevosComentarios);
        }

        return {
          success: true,
          mensaje: 'Estado cambiado: ' + estadoAnterior + ' → ' + datos.nuevoEstado
        };
      }
    }
    throw new Error('Proyecto no encontrado: ' + datos.ID_Proyecto);
  } catch (error) {
    Logger.log('Error en cambiarEstadoGestionProyecto: ' + error.message);
    throw new Error(error.message);
  }
}

function _asegurarHistorialEtapas() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheets = ss.getSheets();
    let historialSheet = sheets.find(s => s.getName() === CONFIG.SHEETS.HISTORIAL_ETAPAS);

    if (!historialSheet) {
      historialSheet = ss.insertSheet(CONFIG.SHEETS.HISTORIAL_ETAPAS);
      historialSheet.appendRow([
        'ID_Proyecto',
        'Etapa_Anterior',
        'Etapa_Nueva',
        'Motivo',
        'Fecha_Inicio',
        'Fecha_Fin',
        'Fecha_Cambio',
        'Usuario'
      ]);
    }
    return historialSheet;
  } catch (error) {
    Logger.log('Error en _asegurarHistorialEtapas: ' + error.message);
    throw error;
  }
}

function _registrarHistorialEtapa(datos) {
  try {
    const historialSheet = _asegurarHistorialEtapas();
    const ahora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const usuario = Session.getActiveUser().getEmail() || 'anonimo';

    historialSheet.appendRow([
      datos.ID_Proyecto || '',
      datos.Etapa_Anterior || '',
      datos.Etapa_Nueva || '',
      datos.Motivo || '',
      datos.Fecha_Inicio || '',
      datos.Fecha_Fin || '',
      ahora,
      usuario
    ]);
  } catch (error) {
    Logger.log('Error en _registrarHistorialEtapa: ' + error.message);
    throw error;
  }
}

function _asegurarColumnaProyectos(sheet, nombreColumna) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let colIndex = headers.indexOf(nombreColumna);
  if (colIndex === -1) {
    colIndex = headers.length;
    sheet.getRange(1, colIndex + 1).setValue(nombreColumna);
  }
  return colIndex;
}

function migrarEsquemaProyectos() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.PROYECTOS);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const colEstadoAntigo = headers.indexOf('Estado');
    if (colEstadoAntigo !== -1) {
      sheet.getRange(1, colEstadoAntigo + 1).setValue(CONFIG.COL_ETAPA);
    }

    const acciones = [];
    acciones.push('Encabezado "Estado" renombrado a "Etapa".');

    _asegurarColumnaProyectos(sheet, CONFIG.COL_PROPIETARIO);
    acciones.push('Columna "Propietario" asegurada.');

    _asegurarColumnaProyectos(sheet, CONFIG.COL_IMPACTO);
    acciones.push('Columna "Impacto" asegurada.');

    _asegurarColumnaProyectos(sheet, CONFIG.COL_ESTADO);
    acciones.push('Columna "Estado" (gestión) asegurada.');

    _asegurarHistorialEtapas();
    acciones.push('Hoja "Historial_Etapas" asegurada.');

    _asegurarHojaSprints();
    acciones.push('Hoja "Sprints" asegurada.');

    const sheetTareas = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                      .getSheetByName(CONFIG.SHEETS.TAREAS);
    if (sheetTareas) {
      let headersTareas = sheetTareas.getRange(1, 1, 1, sheetTareas.getLastColumn()).getValues()[0];
      if (!headersTareas.includes(CONFIG.COL_SPRINT)) {
        sheetTareas.getRange(1, headersTareas.length + 1).setValue(CONFIG.COL_SPRINT);
        headersTareas = sheetTareas.getRange(1, 1, 1, sheetTareas.getLastColumn()).getValues()[0];
        acciones.push('Columna "ID_Sprint" asegurada en Tareas.');
      }
      const nuevasColumnasTareas = [
        CONFIG.COL_SPRINT_NOMBRE,
        CONFIG.COL_SPRINT_FECHA_INICIO,
        CONFIG.COL_SPRINT_FECHA_FIN
      ];
      nuevasColumnasTareas.forEach(col => {
        const currentHeaders = sheetTareas.getRange(1, 1, 1, sheetTareas.getLastColumn()).getValues()[0];
        if (!currentHeaders.includes(col)) {
          sheetTareas.getRange(1, currentHeaders.length + 1).setValue(col);
          acciones.push('Columna "' + col + '" asegurada en Tareas.');
        }
      });
    }

    const resumen = 'Migración completada:\n - ' + acciones.join('\n - ');
    Logger.log(resumen);
    return resumen;
  } catch (error) {
    Logger.log('Error en migrarEsquemaProyectos: ' + error.message);
    throw error;
  }
}

/* ============================================================
 * OPERACIONES: TAREAS
 * ============================================================ */

function obtenerTareas() {
  try {
    const proyectosUsuario = obtenerProyectos();
    const idsProyectosUsuario = new Set(proyectosUsuario.map(p => p.ID_Proyecto));

    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.TAREAS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return [];

    const headers = data[0];
    return data.slice(1)
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => {
          if (row[i] instanceof Date) {
            obj[h] = Utilities.formatDate(row[i], Session.getScriptTimeZone(), 'yyyy-MM-dd');
          } else {
            obj[h] = row[i];
          }
        });
        return obj;
      })
      .filter(t => idsProyectosUsuario.has(t.ID_Proyecto));
  } catch (error) {
    Logger.log('Error en obtenerTareas: ' + error.message);
    throw new Error('No se pudieron cargar las tareas: ' + error.message);
  }
}

function crearTarea(tarea) {
  try {
    if (!tarea.Nombre_Tarea || tarea.Nombre_Tarea.trim().length < 3) {
      throw new Error('El nombre de la tarea debe tener al menos 3 caracteres.');
    }
    if (!tarea.ID_Proyecto) {
      throw new Error('Debe seleccionar un proyecto.');
    }
    if (!tarea.Asignado_A || !validarEmail(tarea.Asignado_A)) {
      throw new Error('El correo del asignado no es válido.');
    }

    const proyectos = obtenerProyectos();
    const proyectoExiste = proyectos.some(p => p.ID_Proyecto === tarea.ID_Proyecto);
    if (!proyectoExiste) {
      throw new Error('El proyecto seleccionado no existe.');
    }

    if (!tarea.Estado_Proyecto_Asignado) {
      throw new Error('Debe seleccionar el estado del proyecto al que se asigna la tarea.');
    }
    if (!CONFIG.ESTADOS_PROYECTO.includes(tarea.Estado_Proyecto_Asignado)) {
      throw new Error('Estado de proyecto no válido: ' + tarea.Estado_Proyecto_Asignado);
    }

    const idSprint = String(tarea.ID_Sprint || '').trim();
    if (!idSprint) {
      throw new Error('Debe seleccionar un Sprint para la tarea.');
    }
    const sprintsProyecto = obtenerSprints(tarea.ID_Proyecto);
    const sprintSeleccionado = sprintsProyecto.find(s => s.ID_Sprint === idSprint);
    if (!sprintSeleccionado) {
      throw new Error('El Sprint seleccionado no pertenece al proyecto indicado.');
    }

    const fechaEntregaDerivada = String(sprintSeleccionado.Fecha_Fin || '').trim();
    const nombreSprint         = String(sprintSeleccionado.Nombre      || '').trim();
    const fechaInicioSprint    = String(sprintSeleccionado.Fecha_Inicio || '').trim();
    const fechaFinSprint       = fechaEntregaDerivada;

    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.TAREAS);
    const nuevoId = generarIdUnico(CONFIG.PREFIJO_TAREA, sheet);

    let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const columnasRequeridas = [
      CONFIG.COL_SPRINT,
      CONFIG.COL_SPRINT_NOMBRE,
      CONFIG.COL_SPRINT_FECHA_INICIO,
      CONFIG.COL_SPRINT_FECHA_FIN
    ];
    columnasRequeridas.forEach(col => {
      const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (!currentHeaders.includes(col)) {
        sheet.getRange(1, currentHeaders.length + 1).setValue(col);
      }
    });
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    sheet.appendRow([
      nuevoId,
      tarea.ID_Proyecto,
      tarea.Nombre_Tarea.trim(),
      tarea.Asignado_A.trim().toLowerCase(),
      fechaEntregaDerivada,
      'Pendiente',
      tarea.Prioridad || 'Media',
      tarea.Descripcion || '',
      tarea.Comentarios || '',
      '',
      tarea.Estado_Proyecto_Asignado,
      idSprint,
      nombreSprint,
      fechaInicioSprint,
      fechaFinSprint
    ]);

    let recordatorioMsg = '';
    if (tarea.crearRecordatorio === true || tarea.crearRecordatorio === 'true') {
      try {
        crearRecordatorioCalendar(
          tarea.Nombre_Tarea.trim(),
          tarea.Fecha_Recordatorio,
          tarea.Hora_Recordatorio,
          tarea.Descripcion || '',
          tarea.Asignado_A ? tarea.Asignado_A.trim().toLowerCase() : ''
        );
        recordatorioMsg = ' Recordatorio agregado a Google Calendar.';
      } catch (calError) {
        Logger.log('Advertencia en crearTarea (Calendar): ' + calError.message);
        recordatorioMsg = ' (No se pudo crear el recordatorio: ' + calError.message + ')';
      }
    }

    return {
      success: true,
      id: nuevoId,
      mensaje: 'Tarea creada correctamente.' + recordatorioMsg
    };
  } catch (error) {
    Logger.log('Error en crearTarea: ' + error.message);
    throw new Error(error.message);
  }
}

function crearRecordatorioCalendar(nombreTarea, fecha, hora, descripcion, invitado) {
  const nombre = String(nombreTarea || '').trim();
  const f = String(fecha || '').trim();
  const h = String(hora || '').trim();

  if (!nombre) throw new Error('Falta el nombre de la tarea para el recordatorio.');
  if (!f || !h) throw new Error('Falta la fecha o la hora del recordatorio.');

  const partesFecha = f.split('-');
  const partesHora  = h.split(':');
  if (partesFecha.length < 3 || partesHora.length < 2) {
    throw new Error('Formato de fecha/hora del recordatorio no válido.');
  }

  const anio    = parseInt(partesFecha[0], 10);
  const mes     = parseInt(partesFecha[1], 10) - 1;
  const dia     = parseInt(partesFecha[2], 10);
  const horas   = parseInt(partesHora[0], 10);
  const minutos = parseInt(partesHora[1], 10);

  const inicio = new Date(anio, mes, dia, horas, minutos, 0);
  if (isNaN(inicio.getTime())) {
    throw new Error('No se pudo interpretar la fecha y hora del recordatorio.');
  }
  const fin = new Date(inicio.getTime() + 30 * 60 * 1000);

  const titulo  = 'Recordatorio: ' + nombre;
  const opciones = { description: descripcion ? String(descripcion) : '' };
  const inv = String(invitado || '').trim();
  if (inv && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inv)) {
    opciones.guests      = inv;
    opciones.sendInvites = true;
  }

  const calendario = CalendarApp.getDefaultCalendar();
  if (!calendario) {
    throw new Error('No se pudo acceder al calendario predeterminado. Revisa los permisos.');
  }
  const evento = calendario.createEvent(titulo, inicio, fin, opciones);

  try {
    evento.addPopupReminder(10);
  } catch (e) {
    Logger.log('No se pudo agregar el aviso emergente al recordatorio: ' + e.message);
  }

  return true;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).trim());
}

function actualizarTarea(datos) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.TAREAS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const colIndex          = headers.indexOf(datos.campo);
    const colEstado         = headers.indexOf('Estado_Tarea');
    const colFechaCompletada = headers.indexOf('Fecha_Completada');
    if (colIndex === -1) throw new Error('Campo no válido: ' + datos.campo);
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === datos.ID_Tarea) {
        const estadoActual = data[i][colEstado];
        if (estadoActual === 'Completada' && !datos.forzarDesbloqueo) {
          throw new Error('🔒 Esta tarea está completada y bloqueada. Use "Reabrir tarea" para modificarla.');
        }

        sheet.getRange(i + 1, colIndex + 1).setValue(datos.valor);
        if (datos.campo === 'Estado_Tarea' && datos.valor === 'Completada') {
          const fechaHoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
          sheet.getRange(i + 1, colFechaCompletada + 1).setValue(fechaHoy);
        }

        if (datos.campo === 'Estado_Tarea' && datos.valor !== 'Completada' && estadoActual === 'Completada') {
          sheet.getRange(i + 1, colFechaCompletada + 1).setValue('');
        }

        return { success: true, mensaje: 'Tarea actualizada.' };
      }
    }
    throw new Error('Tarea no encontrada: ' + datos.ID_Tarea);
  } catch (error) {
    Logger.log('Error en actualizarTarea: ' + error.message);
    throw new Error(error.message);
  }
}

function cambiarEstadoTareaConComentario(datos) {
  try {
    if (!datos.comentario || datos.comentario.trim().length < 5) {
      throw new Error('Por favor ingresa un comentario válido.');
    }
    if (!CONFIG.ESTADOS_TAREA.includes(datos.nuevoEstado)) {
      throw new Error('Estado no válido: ' + datos.nuevoEstado);
    }

    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.TAREAS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const colEstado          = headers.indexOf('Estado_Tarea');
    const colComentarios     = headers.indexOf('Comentarios');
    const colFechaCompletada = headers.indexOf('Fecha_Completada');
    if (colEstado === -1)      throw new Error('Columna Estado_Tarea no encontrada.');
    if (colComentarios === -1) throw new Error('Falta la columna "Comentarios" en el Sheet.');
    if (colFechaCompletada === -1) throw new Error('Falta la columna "Fecha_Completada" en el Sheet.');

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === datos.ID_Tarea) {
        const estadoAnterior  = data[i][colEstado];
        const puedeDesbloquear = datos.forzarDesbloqueo === true || datos.forzarDesbloqueo === 'true';
        if (estadoAnterior === 'Completada' && !puedeDesbloquear) {
          throw new Error('Esta tarea está completada y bloqueada. Use Reabrir.');
        }

        if (estadoAnterior === datos.nuevoEstado) {
          throw new Error('La tarea ya está en ese estado.');
        }

        const usuario   = Session.getActiveUser().getEmail() || 'usuario_anonimo';
        const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
        const entradaHistorial = '[' + timestamp + '] ' + usuario + ': ' +
          estadoAnterior + ' → ' + datos.nuevoEstado + '. ' + datos.comentario.trim();

        const comentariosPrevios = data[i][colComentarios] || '';
        const nuevosComentarios  = comentariosPrevios
          ? entradaHistorial + '\n' + comentariosPrevios
          : entradaHistorial;

        sheet.getRange(i + 1, colEstado      + 1).setValue(datos.nuevoEstado);
        sheet.getRange(i + 1, colComentarios + 1).setValue(nuevosComentarios);

        if (datos.nuevoEstado === 'Completada') {
          const fechaHoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
          sheet.getRange(i + 1, colFechaCompletada + 1).setValue(fechaHoy);
        } else if (estadoAnterior === 'Completada') {
          sheet.getRange(i + 1, colFechaCompletada + 1).setValue('');
        }

        return {
          success: true,
          mensaje: 'Estado cambiado: ' + estadoAnterior + ' → ' + datos.nuevoEstado
        };
      }
    }
    throw new Error('Tarea no encontrada: ' + datos.ID_Tarea);
  } catch (error) {
    Logger.log('Error en cambiarEstadoTareaConComentario: ' + error.message);
    throw new Error(error.message);
  }
}

function agregarComentarioTarea(datos) {
  try {
    if (!datos.comentario || datos.comentario.trim().length < 5) {
      throw new Error('Por favor ingresa un comentario válido.');
    }

    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.TAREAS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const colEstado      = headers.indexOf('Estado_Tarea');
    const colComentarios = headers.indexOf('Comentarios');
    if (colEstado === -1)      throw new Error('Columna Estado_Tarea no encontrada.');
    if (colComentarios === -1) throw new Error('Falta la columna "Comentarios" en el Sheet.');

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === datos.ID_Tarea) {
        const estadoActual = data[i][colEstado];
        if (estadoActual === 'Completada') {
          throw new Error('Esta tarea está completada y no admite nuevos comentarios.');
        }

        const usuario   = Session.getActiveUser().getEmail() || 'usuario_anonimo';
        const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
        const entradaHistorial = '[' + timestamp + '] ' + usuario + ' (comentario): ' + datos.comentario.trim();

        const comentariosPrevios = data[i][colComentarios] || '';
        const nuevosComentarios  = comentariosPrevios
          ? entradaHistorial + '\n' + comentariosPrevios
          : entradaHistorial;

        sheet.getRange(i + 1, colComentarios + 1).setValue(nuevosComentarios);
        return { success: true, mensaje: 'Comentario agregado.' };
      }
    }
    throw new Error('Tarea no encontrada: ' + datos.ID_Tarea);
  } catch (error) {
    Logger.log('Error en agregarComentarioTarea: ' + error.message);
    throw new Error(error.message);
  }
}

/* ============================================================
 * OPERACIONES: SPRINTS
 * ============================================================ */

function _asegurarHojaSprints() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sprintSheet = ss.getSheetByName(CONFIG.SHEETS.SPRINTS);

    if (!sprintSheet) {
      sprintSheet = ss.insertSheet(CONFIG.SHEETS.SPRINTS);
      sprintSheet.appendRow([
        'ID_Sprint',
        'ID_Proyecto',
        'Nombre',
        'Descripcion',
        'Fecha_Inicio',
        'Fecha_Fin'
      ]);
      Logger.log('Hoja Sprints creada.');
    }
    return sprintSheet;
  } catch (error) {
    Logger.log('Error en _asegurarHojaSprints: ' + error.message);
    throw error;
  }
}

function _generarNombreSprintEtapa(idProyecto, nuevaEtapa) {
  try {
    const sprintsExistentes = obtenerSprints(idProyecto);
    const numero = sprintsExistentes.length + 1;
    return 'Sprint ' + numero + ' — ' + nuevaEtapa;
  } catch (e) {
    return 'Sprint — ' + nuevaEtapa;
  }
}

function crearSprint(datos) {
  try {
    if (!datos || !datos.ID_Proyecto) {
      throw new Error('Falta el ID del proyecto para el Sprint.');
    }
    if (!datos.Nombre || String(datos.Nombre).trim().length < 2) {
      throw new Error('El nombre del Sprint debe tener al menos 2 caracteres.');
    }

    const sheet = _asegurarHojaSprints();
    const nuevoId = generarIdUnico(CONFIG.PREFIJO_SPRINT, sheet);

    sheet.appendRow([
      nuevoId,
      datos.ID_Proyecto,
      String(datos.Nombre).trim(),
      String(datos.Descripcion || '').trim(),
      datos.Fecha_Inicio || '',
      datos.Fecha_Fin || ''
    ]);

    Logger.log('Sprint creado: ' + nuevoId + ' para proyecto ' + datos.ID_Proyecto);

    return {
      success: true,
      id: nuevoId,
      mensaje: 'Sprint "' + datos.Nombre + '" creado correctamente.'
    };
  } catch (error) {
    Logger.log('Error en crearSprint: ' + error.message);
    throw new Error(error.message);
  }
}

function obtenerSprints(idProyecto) {
  try {
    const sheet = _asegurarHojaSprints();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return [];

    const headers = data[0];
    const sprints = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = (row[i] instanceof Date)
          ? Utilities.formatDate(row[i], Session.getScriptTimeZone(), 'yyyy-MM-dd')
          : row[i];
      });
      return obj;
    });

    if (idProyecto) {
      return sprints.filter(s => s.ID_Proyecto === idProyecto);
    }
    return sprints;
  } catch (error) {
    Logger.log('Error en obtenerSprints: ' + error.message);
    throw new Error('No se pudieron cargar los Sprints: ' + error.message);
  }
}

function eliminarSprint(idSprint) {
  try {
    if (!idSprint) throw new Error('Falta el ID del Sprint.');

    const sheet = _asegurarHojaSprints();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === idSprint) {
        sheet.deleteRow(i + 1);
        return { success: true, mensaje: 'Sprint eliminado.' };
      }
    }
    throw new Error('Sprint no encontrado: ' + idSprint);
  } catch (error) {
    Logger.log('Error en eliminarSprint: ' + error.message);
    throw new Error(error.message);
  }
}

/* ============================================================
 * SOLUCIÓN 1: CREAR TAREAS AUTOMÁTICAS Y ACTUALIZAR FECHAS
 * ============================================================ */

function _crearTareasAutomaticasProyecto(datos) {
  try {
    if (!datos || !datos.ID_Proyecto || !datos.etapaInicial || !datos.propietario) {
      throw new Error('Parámetros incompletos para crear tareas automáticas.');
    }

    const numeroEtapaInicial = parseInt(datos.etapaInicial.charAt(0));
    if (isNaN(numeroEtapaInicial) || numeroEtapaInicial < 1 || numeroEtapaInicial > 5) {
      throw new Error('Etapa inicial no válida: ' + datos.etapaInicial);
    }

    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.TAREAS);

    const columnasRequeridaAuto = [
      CONFIG.COL_SPRINT,
      CONFIG.COL_SPRINT_NOMBRE,
      CONFIG.COL_SPRINT_FECHA_INICIO,
      CONFIG.COL_SPRINT_FECHA_FIN
    ];
    columnasRequeridaAuto.forEach(col => {
      const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (!currentHeaders.includes(col)) {
        sheet.getRange(1, currentHeaders.length + 1).setValue(col);
      }
    });

    const sprintId          = String(datos.sprintId          || '').trim();
    const sprintNombre      = String(datos.sprintNombre      || '').trim();
    const sprintFechaInicio = String(datos.sprintFechaInicio || '').trim();
    const sprintFechaFin    = String(datos.sprintFechaFin    || datos.fechaFinEtapa || '').trim();

    let contadorTareas = 0;
    const propietarioEmail = String(datos.propietario).trim().toLowerCase();

    for (let numEtapa = numeroEtapaInicial; numEtapa <= 5; numEtapa++) {
      const strNumEtapa = String(numEtapa);
      const tareasPorEtapa = CONFIG.TAREAS_POR_ETAPA[strNumEtapa] || [];
      const etapaCompleta = CONFIG.ESTADOS_PROYECTO.find(e => e.startsWith(strNumEtapa + ' '));

      const fechaEntrega = sprintFechaFin || String(datos.fechaFinEtapa || '').trim();

      tareasPorEtapa.forEach(nombreTarea => {
        const nuevoId = generarIdUnico(CONFIG.PREFIJO_TAREA, sheet);
        sheet.appendRow([
          nuevoId,
          datos.ID_Proyecto,
          nombreTarea,
          propietarioEmail,
          fechaEntrega,
          'Pendiente',
          'Alta',
          '',
          '',
          '',
          etapaCompleta || '',
          sprintId,
          sprintNombre,
          sprintFechaInicio,
          sprintFechaFin
        ]);
        contadorTareas++;
      });
    }

    Logger.log('Tareas automáticas creadas para proyecto ' + datos.ID_Proyecto + ': ' + contadorTareas);
  } catch (error) {
    Logger.log('Error en _crearTareasAutomaticasProyecto: ' + error.message);
    throw error;
  }
}

function _actualizarFechasTareasEtapa(idProyecto, nuevaEtapa, fechaFin) {
  try {
    if (!idProyecto || !nuevaEtapa || !fechaFin) {
      throw new Error('Parámetros incompletos para actualizar fechas de tareas.');
    }

    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.TAREAS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const colIDProyecto = headers.indexOf('ID_Proyecto');
    const colEstadoProyecto = headers.indexOf('Estado_Proyecto_Asignado');
    const colFechaEntrega = headers.indexOf('Fecha_Entrega');

    if (colIDProyecto === -1 || colEstadoProyecto === -1 || colFechaEntrega === -1) {
      throw new Error('No se encontraron las columnas requeridas en Tareas.');
    }

    let tareasActualizadas = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i][colIDProyecto] === idProyecto && data[i][colEstadoProyecto] === nuevaEtapa) {
        sheet.getRange(i + 1, colFechaEntrega + 1).setValue(fechaFin);
        tareasActualizadas++;
      }
    }

    if (tareasActualizadas > 0) {
      Logger.log('Fechas actualizadas para ' + tareasActualizadas + ' tareas de ' + idProyecto);
    }
  } catch (error) {
    Logger.log('Error en _actualizarFechasTareasEtapa: ' + error.message);
    throw error;
  }
}

function calcularProgresoEsperado(fechaInicio, fechaFin) {
  const inicio = fechaInicio ? new Date(String(fechaInicio)) : null;
  const fin = fechaFin ? new Date(String(fechaFin)) : null;

  if (!inicio || !fin || isNaN(inicio) || isNaN(fin)) {
    return null;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (hoy <= inicio) return 0;
  if (hoy >= fin) return 100;

  const totalMs = fin.getTime() - inicio.getTime();
  const transcurridoMs = hoy.getTime() - inicio.getTime();
  return Math.round((transcurridoMs / totalMs) * 100);
}

function obtenerProyectosConAnalisis() {
  const proyectos = obtenerProyectos();

  return proyectos.map(p => {
    const esperado = calcularProgresoEsperado(p.Fecha_Inicio, p.Fecha_Fin);
    const real     = Number(p.Progreso) || 0;

    let estadoComparacion = 'sin_fechas';
    let desviacion = null;

    if (esperado !== null) {
      desviacion = real - esperado;
      if (desviacion >= 5)   estadoComparacion = 'adelantado';
      else if (desviacion <= -10) estadoComparacion = 'atrasado';
      else estadoComparacion = 'en_tiempo';
    }

    return {
      ...p,
      Progreso_Esperado:   esperado,
      Desviacion:          desviacion,
      Estado_Comparacion:  estadoComparacion
    };
  });
}