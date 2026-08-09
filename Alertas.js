/**
 * ============================================================
 * SISTEMA DE ALERTAS POR CORREO
 * ============================================================
 * Función que será ejecutada por el trigger diario.
 *
 * CAMBIOS (REQ 5):
 *   - revisarTareasYEnviarAlertas(): usa _obtenerTodasLasTareas() y
 *     _obtenerTodosLosProyectos() (sin filtro de usuario, pues es un
 *     trigger del sistema). Agrega validaciones de fila vacía y
 *     try/catch por tarea para que un error individual no detenga el proceso.
 *   - enviarCorreoAlerta(): corregido con cuatro niveles de guardia que
 *     previenen el error "Cannot read properties of undefined (reading 'Asignado_A')".
 */

function revisarTareasYEnviarAlertas() {
  try {
    // El trigger del sistema opera sobre TODOS los proyectos/tareas,
    // independientemente del propietario. Por eso se usan las versiones
    // internas sin filtro de usuario.
    const tareas    = _obtenerTodasLasTareas();
    const proyectos = _obtenerTodosLosProyectos();
    const config    = obtenerConfiguracion();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const tareasAlertar = tareas.filter(tarea => {
      // Guardia 1: omitir filas vacías o mal formadas
      if (!tarea || typeof tarea !== 'object') return false;
      if (!tarea.ID_Tarea) return false;

      // Guardia 2: estado válido para alerta
      const estadoTarea = String(tarea.Estado_Tarea || '').trim();
      if (estadoTarea !== 'Pendiente' && estadoTarea !== 'En Proceso') return false;

      // Guardia 3: fecha de entrega presente y parseable
      const fechaStr = String(tarea.Fecha_Entrega || '').trim();
      if (!fechaStr) return false;
      const fechaEntrega = new Date(fechaStr);
      if (isNaN(fechaEntrega.getTime())) return false;
      fechaEntrega.setHours(0, 0, 0, 0);

      return fechaEntrega.getTime() <= hoy.getTime();
    });

    Logger.log('Tareas a alertar: ' + tareasAlertar.length);

    tareasAlertar.forEach(tarea => {
      try {
        const proyecto = proyectos.find(p => p.ID_Proyecto === tarea.ID_Proyecto);
        enviarCorreoAlerta(tarea, proyecto, config.correos);
      } catch (innerError) {
        // Un error en una tarea individual no detiene las demás alertas
        Logger.log('Error procesando tarea ' +
          (tarea && tarea.ID_Tarea ? tarea.ID_Tarea : 'desconocida') +
          ': ' + innerError.message);
      }
    });

    return 'Proceso completado. ' + tareasAlertar.length + ' alertas enviadas.';
  } catch (error) {
    Logger.log('Error en revisarTareasYEnviarAlertas: ' + error.message);
    throw error;
  }
}

/**
 * Envía el correo de alerta para una tarea vencida o que vence hoy.
 *
 * Correcciones aplicadas (REQ 5):
 *   - Guardia 1: valida que tarea sea un objeto no nulo antes de acceder a sus propiedades.
 *   - Guardia 2: valida que Asignado_A exista y contenga '@'.
 *   - Guardia 3: valida que Fecha_Entrega sea parseable como fecha.
 *   - Guardia 4: valida que correosCC sea un array.
 *   - Todos los accesos a propiedades de tarea y proyecto usan || '' como fallback.
 *   - El bloque catch no relanza: el caller ya tiene su propio try/catch por tarea.
 */
function enviarCorreoAlerta(tarea, proyecto, correosCC) {
  try {
    // ── Guardia 1: tarea debe ser un objeto válido ──────────────────
    if (!tarea || typeof tarea !== 'object') {
      Logger.log('enviarCorreoAlerta: tarea inválida o null — se omite.');
      return;
    }

    // ── Guardia 2: correo del destinatario ──────────────────────────
    const destinatario = String(tarea.Asignado_A || '').trim();
    if (!destinatario || !destinatario.includes('@')) {
      Logger.log('Correo inválido para tarea: ' + (tarea.ID_Tarea || 'sin ID'));
      return;
    }

    // ── Guardia 3: fecha de entrega parseable ───────────────────────
    const fechaStr = String(tarea.Fecha_Entrega || '').trim();
    if (!fechaStr) {
      Logger.log('Sin fecha de entrega para tarea: ' + (tarea.ID_Tarea || 'sin ID'));
      return;
    }
    const fechaEntrega = new Date(fechaStr);
    if (isNaN(fechaEntrega.getTime())) {
      Logger.log('Fecha inválida en tarea: ' + (tarea.ID_Tarea || 'sin ID'));
      return;
    }
    fechaEntrega.setHours(0, 0, 0, 0);

    // ── Guardia 4: correosCC debe ser array ─────────────────────────
    const cc = Array.isArray(correosCC) ? correosCC.filter(Boolean) : [];

    // ── Cálculo de días vencidos ────────────────────────────────────
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diasVencidos = Math.floor((hoy - fechaEntrega) / (1000 * 60 * 60 * 24));
    const estado       = diasVencidos > 0
      ? 'VENCIDA hace ' + diasVencidos + ' día(s)'
      : 'VENCE HOY';
    const colorAlerta  = diasVencidos > 0 ? '#395fbf' : '#f59e0b';

    // ── Datos del proyecto con fallbacks seguros ────────────────────
    const nombreProyecto = (proyecto && proyecto.Nombre)
      ? String(proyecto.Nombre)
      : String(tarea.ID_Proyecto || 'sin proyecto');

    // ── Propiedades de la tarea con fallbacks seguros ───────────────
    const nombreTarea = String(tarea.Nombre_Tarea || '(sin nombre)');
    const prioridad   = String(tarea.Prioridad    || 'No definida');
    const idTarea     = String(tarea.ID_Tarea     || '');

    // ── Botón de acceso directo ─────────────────────────────────────
    const urlBase = obtenerUrlWebApp();
    let botonHtml = '';
    if (urlBase && idTarea) {
      const sep    = urlBase.indexOf('?') > -1 ? '&' : '?';
      const enlace = urlBase + sep + 'vista=tareas&tarea=' + encodeURIComponent(idTarea);
      botonHtml =
        '<div style="text-align:center; margin:24px 0;">' +
          '<a href="' + enlace + '" target="_blank"' +
          ' style="display:inline-block; background:' + colorAlerta + '; color:#ffffff; text-decoration:none;' +
          ' font-weight:600; padding:13px 28px; border-radius:8px; font-family:Arial, sans-serif;">' +
          '🔗 Abrir esta tarea en el sistema' +
          '</a>' +
        '</div>';
    }

    // ── Cuerpo del correo HTML ──────────────────────────────────────
    const htmlBody =
      '<!DOCTYPE html>' +
      '<html><body style="font-family: Arial, sans-serif; background:#f3f4f6; padding:20px;">' +
        '<div style="max-width:600px; margin:auto; background:white; border-radius:8px;' +
             ' overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">' +
          '<div style="background:' + colorAlerta + '; color:white; padding:20px;">' +
            '<h2 style="margin:0;">⚠️ Alerta de Tarea</h2>' +
            '<p style="margin:5px 0 0 0;">' + estado + '</p>' +
          '</div>' +
          '<div style="padding:25px;">' +
            '<p>Hola,</p>' +
            '<p>Tienes una tarea pendiente que requiere tu revisión inmediata:</p>' +
            '<table style="width:100%; border-collapse:collapse; margin:20px 0;">' +
              '<tr><td style="padding:8px; background:#f9fafb;"><strong>Nombre:</strong></td>' +
                  '<td style="padding:8px;">' + nombreTarea + '</td></tr>' +
              '<tr><td style="padding:8px; background:#f9fafb;"><strong>Proyecto:</strong></td>' +
                  '<td style="padding:8px;">' + nombreProyecto + '</td></tr>' +
              '<tr><td style="padding:8px; background:#f9fafb;"><strong>Fecha Entrega:</strong></td>' +
                  '<td style="padding:8px;">' + fechaStr + '</td></tr>' +
              '<tr><td style="padding:8px; background:#f9fafb;"><strong>Prioridad:</strong></td>' +
                  '<td style="padding:8px;">' + prioridad + '</td></tr>' +
            '</table>' +
            botonHtml +
            '<p>Por favor, actualiza el estado de esta tarea en el sistema lo antes posible' +
               ' para no ver afectaciones en el cronograma.</p>' +
            '<p style="color:#6b7280; font-size:12px; margin-top:30px;' +
                ' border-top:1px solid #e5e7eb; padding-top:15px;">' +
              'Este es un mensaje automático de Aceleración de Innovación.' +
            '</p>' +
          '</div>' +
        '</div>' +
      '</body></html>';

    MailApp.sendEmail({
      to:       destinatario,
      cc:       cc.join(','),
      subject:  CONFIG.ASUNTO_ALERTA + ' - ' + ' Iniciativa: ' + nombreProyecto,
      htmlBody: htmlBody
    });

    Logger.log('Correo enviado a ' + destinatario + ' para tarea ' + idTarea);

  } catch (error) {
    // No relanzar: el caller (revisarTareasYEnviarAlertas) ya maneja
    // errores individuales por tarea con su propio try/catch.
    Logger.log('Error enviando correo para tarea ' +
      (tarea && tarea.ID_Tarea ? tarea.ID_Tarea : 'desconocida') +
      ': ' + error.message);
  }
}

/**
 * Devuelve la URL de la Web App para enlaces de correo.
 * Usa CONFIG.WEBAPP_URL si está definida; si no, intenta detectarla.
 */
function obtenerUrlWebApp() {
  if (CONFIG.WEBAPP_URL && String(CONFIG.WEBAPP_URL).trim()) {
    return String(CONFIG.WEBAPP_URL).trim();
  }
  try {
    return ScriptApp.getService().getUrl() || '';
  } catch (e) {
    Logger.log('No se pudo obtener la URL de la Web App: ' + e.message);
    return '';
  }
}

function crearTriggerDiario() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'revisarTareasYEnviarAlertas') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('revisarTareasYEnviarAlertas')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
  Logger.log('Trigger diario creado exitosamente.');
}