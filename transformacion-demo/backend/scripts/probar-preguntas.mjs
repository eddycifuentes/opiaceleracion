/**
 * Script de pruebas para el endpoint /api/chat del Asistente IA.
 *
 * Envía una batería de preguntas (una por una, con 1 segundo de pausa entre
 * cada una) e imprime la pregunta, el valor esperado, la respuesta recibida
 * y si la respuesta contiene el texto de fallback.
 *
 * Uso:
 *   node scripts/probar-preguntas.mjs        (desde la carpeta backend/)
 *
 * URL configurable con la variable de entorno API_URL. Si no existe, usa
 * http://localhost:3000.
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEXTO_FALLBACK = 'Disculpa, no pude procesar tu solicitud';

// Preguntas de prueba con el resultado esperado (solo informativo en consola).
const PREGUNTAS = [
  { pregunta: '¿Cuántas iniciativas hay en total?', esperado: '8' },
  { pregunta: '¿Cuántas iniciativas están activas?', esperado: '6' },
  { pregunta: '¿Qué iniciativas tiene Davivienda?', esperado: '3' },
  { pregunta: '¿En qué etapa está el Portal Digital Davivienda?', esperado: '4 DELIVERY' },
  { pregunta: '¿Cuántas tareas están pendientes?', esperado: '12' },
  { pregunta: '¿Cuántas tareas están en proceso?', esperado: '9' },
  { pregunta: '¿Cuántas tareas están completadas?', esperado: '4' },
  { pregunta: '¿Cuántas tareas tienen prioridad alta?', esperado: '15' },
  { pregunta: '¿Cuántos sprints hay y cuáles están en curso?', esperado: '6; en curso Sprint 1 y Sprint 2' },
  { pregunta: 'Dame un resumen general del portafolio.', esperado: '8 iniciativas, 25 tareas, 12 pendientes, 9 en proceso, 4 completadas, 2 sprints en curso' },
];

/**
 * Pausa la ejecución durante los milisegundos indicados.
 * @param {number} ms - Milisegundos a esperar.
 * @returns {Promise<void>}
 */
function pausa(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Envía una pregunta al endpoint /api/chat y devuelve la respuesta de texto.
 * @param {string} pregunta - Pregunta a enviar.
 * @returns {Promise<string>} Texto de la respuesta del asistente.
 */
async function preguntar(pregunta) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: pregunta }),
  });

  const data = await res.json();

  if (!res.ok) {
    return `[HTTP ${res.status}] ${data.error || 'Error desconocido'}`;
  }

  return data.response ?? '';
}

/**
 * Ejecuta la batería de preguntas secuencialmente e imprime los resultados.
 * @returns {Promise<void>}
 */
async function main() {
  console.log(`Probando endpoint: ${API_URL}/api/chat\n`);

  let fallos = 0;

  for (let i = 0; i < PREGUNTAS.length; i++) {
    const { pregunta, esperado } = PREGUNTAS[i];

    let respuesta;
    try {
      respuesta = await preguntar(pregunta);
    } catch (error) {
      respuesta = `[ERROR DE RED] ${error.message}`;
    }

    const usaFallback = respuesta.includes(TEXTO_FALLBACK);
    if (usaFallback) fallos++;

    console.log(`${i + 1}. Pregunta: ${pregunta}`);
    console.log(`   Esperado: ${esperado}`);
    console.log(`   Respuesta: ${respuesta}`);
    console.log(`   ¿Fallback?: ${usaFallback ? 'SÍ ⚠️' : 'no'}`);
    console.log('');

    // Pausa de 1 segundo entre preguntas (salvo tras la última).
    if (i < PREGUNTAS.length - 1) {
      await pausa(1000);
    }
  }

  console.log(`Resumen: ${PREGUNTAS.length - fallos}/${PREGUNTAS.length} sin fallback, ${fallos} con fallback.`);
}

main().catch((error) => {
  console.error('[Fatal]', error.message);
  process.exit(1);
});
