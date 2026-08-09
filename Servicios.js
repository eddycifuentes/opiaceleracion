/**
 * ============================================================
 * SERVICIOS REUTILIZABLES
 * ============================================================
 *
 * CAMBIOS:
 *   - obtenerEmailUsuario()          → NUEVA (REQ 1 y REQ 2)
 *   - crearPlantillaProyecto()       → NUEVA (XLSX Fase 1, opcional)
 *   - actualizarPortadaPlantilla()   → NUEVA (XLSX Fase 2, opcional)
 *   - obtenerAdministradores()       → NUEVA (Control de Acceso)
 *   - esAdministrador()              → NUEVA (Control de Acceso)
 * Todo lo demás permanece sin cambios.
 */

/* ============================================================
 * REQ 1 / REQ 2: obtener correo del usuario activo
 * ============================================================ */

/**
 * Devuelve el correo del usuario que está ejecutando la Web App,
 * en minúsculas y sin espacios.
 *
 * PREREQUISITO: La Web App debe publicarse con
 *   "Execute as: User accessing the web app"
 * Si se publica como propietario, este método devolverá el correo
 * del propietario para todos los usuarios.
 *
 * @return {string} Correo en minúsculas o cadena vacía si no disponible.
 */
function obtenerEmailUsuario() {
  try {
    const email = Session.getActiveUser().getEmail();
    return email ? email.trim().toLowerCase() : '';
  } catch (e) {
    Logger.log('obtenerEmailUsuario: no se pudo obtener el email — ' + e.message);
    return '';
  }
}

/* ============================================================
 * CONTROL DE ACCESO: Administradores
 * ============================================================ */

/**
 * Obtiene la lista de administradores del sistema.
 * Lee desde la hoja "Configuración", en la primera columna (email)
 * y segunda columna (rol). Si el rol es "Admin" o "Administrador",
 * el correo se incluye en la lista de administradores.
 *
 * Si CONFIG.ADMINISTRADORES tiene valores, se usan como fallback.
 *
 * @return {Array<string>} Array de correos de administradores en minúsculas.
 */
function obtenerAdministradores() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.CONFIGURACION);
    const data = sheet.getDataRange().getValues();

    const administradores = [];

    // Iterar desde fila 2 (fila 1 es encabezados)
    for (let i = 1; i < data.length; i++) {
      const correo = String(data[i][0] || '').trim().toLowerCase();
      const rol    = String(data[i][1] || '').trim().toLowerCase();

      // Si el correo existe y el rol contiene 'admin', agregar a la lista
      if (correo && correo.includes('@') && 
          (rol === 'admin' || rol === 'administrador' || rol === 'admin_sistema')) {
        administradores.push(correo);
      }
    }

    // Si la hoja no tiene configurados administradores, usar el fallback
    if (administradores.length === 0 && CONFIG.ADMINISTRADORES && CONFIG.ADMINISTRADORES.length > 0) {
      return CONFIG.ADMINISTRADORES.map(e => String(e).trim().toLowerCase());
    }

    return administradores;
  } catch (error) {
    Logger.log('Error en obtenerAdministradores: ' + error.message);
    // Fallback a CONFIG.ADMINISTRADORES en caso de error
    if (CONFIG.ADMINISTRADORES && CONFIG.ADMINISTRADORES.length > 0) {
      return CONFIG.ADMINISTRADORES.map(e => String(e).trim().toLowerCase());
    }
    return [];
  }
}

/**
 * Verifica si el usuario autenticado actual es administrador del sistema.
 *
 * @return {boolean} true si el usuario es administrador, false en caso contrario.
 */
function esAdministrador() {
  try {
    const emailUsuario = obtenerEmailUsuario();
    if (!emailUsuario) return false;

    const administradores = obtenerAdministradores();
    return administradores.includes(emailUsuario);
  } catch (error) {
    Logger.log('Error en esAdministrador: ' + error.message);
    return false;
  }
}

/* ============================================================
 * SERVICIOS DE DRIVE: IDs y carpetas
 * ============================================================ */

function generarIdUnico(prefijo, sheet) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data  = sheet.getDataRange().getValues();
    const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');

    let maxConsecutivo = 0;
    const patron = new RegExp('^' + prefijo + '-' + fecha + '-(\\d+)$');
    for (let i = 1; i < data.length; i++) {
      const match = String(data[i][0]).match(patron);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxConsecutivo) maxConsecutivo = num;
      }
    }

    const siguiente = String(maxConsecutivo + 1).padStart(3, '0');
    return `${prefijo}-${fecha}-${siguiente}`;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Crea la estructura documental de una iniciativa en Google Drive:
 *  - Una carpeta principal dentro de CONFIG.DRIVE_CARPETA_RAIZ_ID.
 *  - Las subcarpetas definidas en CONFIG.SUBCARPETAS_PROYECTO.
 *
 * @param {string} nombreProyecto Nombre exacto de la iniciativa.
 * @return {{id: string, url: string}}
 */
function crearEstructuraCarpetasProyecto(nombreProyecto) {
  const nombre = String(nombreProyecto || '').trim();
  if (!nombre) {
    throw new Error('El nombre de la iniciativa es obligatorio para crear la carpeta.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const carpetaRaiz    = DriveApp.getFolderById(CONFIG.DRIVE_CARPETA_RAIZ_ID);
    const carpetaProyecto = carpetaRaiz.createFolder(nombre);

    CONFIG.SUBCARPETAS_PROYECTO.forEach(function (sub) {
      carpetaProyecto.createFolder(sub);
    });

    return {
      id:  carpetaProyecto.getId(),
      url: carpetaProyecto.getUrl()
    };
  } finally {
    lock.releaseLock();
  }
}

/* ============================================================
 * INTEGRACIÓN PLANTILLA XLSX — FASE 1 (opcional)
 * ============================================================ */

/**
 * Crea una copia de la plantilla XLSX/Google Sheets para el proyecto.
 * La copia se coloca en la carpeta de Drive del proyecto (si se pasa carpetaId)
 * o en la carpeta raíz del sistema (si carpetaId está vacío).
 *
 * Para activar esta función: definir CONFIG.PLANTILLA_XLSX_ID con el ID
 * del archivo plantilla en Google Drive. Si el ID está vacío, la función
 * lanza un error y el llamador lo ignora con try/catch.
 *
 * NOTA IMPORTANTE sobre formatos:
 *   Si la plantilla es un archivo XLSX nativo (no Google Sheets), la copia
 *   también será XLSX y SpreadsheetApp.openById() no podrá abrirla para
 *   modificar celdas (Fase 2). Para habilitar la Fase 2 se debe habilitar
 *   el servicio avanzado "Google Drive API" en Apps Script y convertir la
 *   copia a Google Sheets usando Drive.Files.copy() con mimeType apropiado.
 *
 * @param {string} nombreProyecto  Nombre del proyecto (para el nombre del archivo).
 * @param {string} [carpetaId]     ID de la carpeta destino en Drive (opcional).
 * @return {{id: string, url: string}}
 */
function crearPlantillaProyecto(nombreProyecto, carpetaId) {
  const plantillaId = String(CONFIG.PLANTILLA_XLSX_ID || '').trim();
  if (!plantillaId) {
    throw new Error('CONFIG.PLANTILLA_XLSX_ID no está configurado.');
  }

  const nombre = String(nombreProyecto || '').trim();
  const destino = carpetaId && String(carpetaId).trim()
    ? DriveApp.getFolderById(carpetaId)
    : DriveApp.getFolderById(CONFIG.DRIVE_CARPETA_RAIZ_ID);

  const original    = DriveApp.getFileById(plantillaId);
  const nombreCopia = 'Plan de trabajo - ' + nombre;
  const copia       = original.makeCopy(nombreCopia, destino);

  Logger.log('Plantilla creada: ' + copia.getId() + ' en carpeta: ' + destino.getId());

  return {
    id:  copia.getId(),
    url: copia.getUrl()
  };
}

/* ============================================================
 * INTEGRACIÓN PLANTILLA XLSX — FASE 2 (opcional)
 * ============================================================ */

/**
 * Actualiza las celdas de encabezado en la hoja de trabajo del Google Sheets
 * asociado al proyecto. Solo funciona si la copia fue creada como Google Sheets
 * (no como XLSX nativo).
 *
 * Las referencias de celda (mapa) deben ajustarse a la estructura real
 * de la plantilla activa del equipo.
 *
 * @param {string} spreadsheetId  ID del Google Sheet (copia convertida).
 * @param {Object} datos          Campos a actualizar: { nombre, lider, empresa, estado, progreso }
 */
function actualizarPortadaPlantilla(spreadsheetId, datos) {
  if (!spreadsheetId || !String(spreadsheetId).trim()) {
    throw new Error('actualizarPortadaPlantilla: spreadsheetId requerido.');
  }

  const ss    = SpreadsheetApp.openById(spreadsheetId);
  const hojas = ss.getSheets();

  // Buscar la primera hoja que no sea "Listas"
  const hoja = hojas.find(h => h.getName() !== 'Listas') || hojas[0];
  if (!hoja) throw new Error('No se encontró hoja de trabajo en la plantilla.');

  // ── Mapa de celdas ────────────────────────────────────────────────
  // AJUSTAR estas referencias según la posición real en la plantilla.
  // Los valores observados en la plantilla "Análisis de predios Agro":
  //   B1 → Nombre del proyecto
  //   B2 → Líder línea de negocio (Sponsor)
  //   B3 → Empresa
  //   B4 → Líder Unidad Innovación Abierta
  //   B5 → Estado del proyecto
  const mapa = {
    nombre:  'B1',
    empresa: 'B3',
    lider:   'B4',
    estado:  'B5'
  };

  if (datos.nombre)  hoja.getRange(mapa.nombre).setValue(datos.nombre);
  if (datos.empresa) hoja.getRange(mapa.empresa).setValue(datos.empresa);
  if (datos.lider)   hoja.getRange(mapa.lider).setValue(datos.lider);
  if (datos.estado)  hoja.getRange(mapa.estado).setValue(datos.estado);

  SpreadsheetApp.flush();
  Logger.log('Portada de plantilla actualizada: ' + spreadsheetId);
}

/* ============================================================
 * CONFIGURACIÓN DEL SISTEMA
 * ============================================================ */

function obtenerConfiguracion() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEETS.CONFIGURACION);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return { correos: [], roles: [] };

    const correos = [];
    const roles   = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) correos.push(String(data[i][0]).trim());
      if (data[i][1]) roles.push(String(data[i][1]).trim());
    }

    return { correos, roles };
  } catch (error) {
    Logger.log('Error en obtenerConfiguracion: ' + error.message);
    return { correos: [], roles: [] };
  }
}