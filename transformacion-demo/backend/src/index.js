import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();

// Lista blanca de orígenes permitidos: desarrollo local y producción.
const ORIGENES_PERMITIDOS = [
  'http://localhost:5173',
  'https://opiaceleracion.vercel.app'
];

// Patrón para los despliegues de preview de Vercel.
// Cada push a una rama genera una URL única con sufijo aleatorio
// (p. ej. https://opiaceleracion-git-rama-eacu.vercel.app), por lo que no
// es posible listarlas una por una. El patrón las acepta solo si siguen el
// formato esperado del proyecto, evitando abrir CORS a cualquier *.vercel.app.
const PATRON_PREVIEW = /^https:\/\/opiaceleracion(-[a-z0-9-]+)?-eacu\.vercel\.app$/;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ORIGENES_PERMITIDOS.includes(origin) || PATRON_PREVIEW.test(origin)) {
      return cb(null, true);
    }
    return cb(new Error('Origen no permitido por CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Mock Data
// IMPORTANTE: debe mantenerse igual a src/data/mockData.ts (frontend).
// No se comparte el archivo porque el backend es Node/ESM y el frontend es
// TypeScript (Vite), en carpetas separadas con su propio package.json.
// Estados de tarea válidos: 'Pendiente' | 'En Proceso' | 'Completada'.
// Empresas: 'Davivienda' | 'Seguros Bolívar' | 'Constructora Colombiana'.
// Etapas: '1 DISCOVERY' | '2 CONCEPT' | '3 PROJECT SETUP' | '4 DELIVERY' | '5 LAUNCHPAD'.
// Estado sprint: 'En Curso' | 'Planeado'.
const mockData = {
  iniciativas: [
    { id: 'INI-20250126-001', nombre: 'App Mobile Ahorro', empresa: 'Seguros Bolívar', lider: 'eddy.cifuentes@segurosbolivar.com', etapa: '3 PROJECT SETUP', estado: 'Activo', impacto: 'Ingresos', descripcion: 'Aplicación móvil para gestión de ahorros del cliente', fechaCreacion: '2025-01-10', propietario: 'Eddy Cifuentes' },
    { id: 'INI-20250126-002', nombre: 'Portal Digital Davivienda', empresa: 'Davivienda', lider: 'maria.garcia@davivienda.com', etapa: '4 DELIVERY', estado: 'Activo', impacto: 'Experiencia', descripcion: 'Portal web para banca digital', fechaCreacion: '2024-12-15', propietario: 'María García' },
    { id: 'INI-20250126-003', nombre: 'Sistema Presupuestal Constructora', empresa: 'Constructora Colombiana', lider: 'carlos.rodriguez@constructora.com', etapa: '2 CONCEPT', estado: 'Activo', impacto: 'Operativo', descripcion: 'Sistema de gestión presupuestal para proyectos', fechaCreacion: '2025-01-05', propietario: 'Carlos Rodríguez' },
    { id: 'INI-20250126-004', nombre: 'Analytics Dashboard Seguros', empresa: 'Seguros Bolívar', lider: 'ana.martinez@segurosbolivar.com', etapa: '5 LAUNCHPAD', estado: 'Completado', impacto: 'Decisiones', descripcion: 'Dashboard de análisis de pólizas y siniestros', fechaCreacion: '2024-11-20', propietario: 'Ana Martínez' },
    { id: 'INI-20250126-005', nombre: 'Integración API Davivienda', empresa: 'Davivienda', lider: 'luis.fernandez@davivienda.com', etapa: '1 DISCOVERY', estado: 'Activo', impacto: 'Integración', descripcion: 'Integración de APIs de terceros', fechaCreacion: '2025-01-15', propietario: 'Luis Fernández' },
    { id: 'INI-20250126-006', nombre: 'Chatbot Atención Cliente', empresa: 'Seguros Bolívar', lider: 'sofia.lopez@segurosbolivar.com', etapa: '3 PROJECT SETUP', estado: 'Activo', impacto: 'Experiencia', descripcion: 'Chatbot con IA para atención al cliente', fechaCreacion: '2025-01-08', propietario: 'Sofía López' },
    { id: 'INI-20250126-007', nombre: 'Automatización Reportes Constructora', empresa: 'Constructora Colombiana', lider: 'juan.perez@constructora.com', etapa: '4 DELIVERY', estado: 'Cerrado', impacto: 'Operativo', descripcion: 'Automatización de reportes mensuales', fechaCreacion: '2024-10-01', propietario: 'Juan Pérez' },
    { id: 'INI-20250126-008', nombre: 'Plataforma Inversiones Davivienda', empresa: 'Davivienda', lider: 'diego.torres@davivienda.com', etapa: '2 CONCEPT', estado: 'Activo', impacto: 'Ingresos', descripcion: 'Plataforma de inversión para clientes', fechaCreacion: '2025-01-12', propietario: 'Diego Torres' },
  ],
  tareas: [
    { id: 'TSK-20250126-001', nombre: 'Análisis de requisitos', proyecto: 'INI-20250126-001', estado: 'En Proceso', prioridad: 'Alta', asignado: 'Juan Pérez', fechaEntrega: '2025-01-28', sprint: 'SPR-20250126-001', descripcion: 'Recolectar y analizar requisitos del cliente' },
    { id: 'TSK-20250126-002', nombre: 'Diseño UI/UX', proyecto: 'INI-20250126-001', estado: 'Pendiente', prioridad: 'Alta', asignado: 'María García', fechaEntrega: '2025-02-05', sprint: 'SPR-20250126-001', descripcion: 'Diseñar interfaz de usuario' },
    { id: 'TSK-20250126-003', nombre: 'Setup Ambiente Desarrollo', proyecto: 'INI-20250126-001', estado: 'Completada', prioridad: 'Media', asignado: 'Carlos Rodríguez', fechaEntrega: '2025-01-20', sprint: 'SPR-20250126-001', descripcion: 'Configurar ambiente de desarrollo' },
    { id: 'TSK-20250126-004', nombre: 'Testing Unitario', proyecto: 'INI-20250126-002', estado: 'En Proceso', prioridad: 'Alta', asignado: 'Ana Martínez', fechaEntrega: '2025-01-30', sprint: 'SPR-20250126-002', descripcion: 'Realizar pruebas unitarias' },
    { id: 'TSK-20250126-005', nombre: 'Documentación API', proyecto: 'INI-20250126-002', estado: 'Completada', prioridad: 'Media', asignado: 'Luis Fernández', fechaEntrega: '2025-01-25', sprint: 'SPR-20250126-002', descripcion: 'Documentar endpoints API' },
    { id: 'TSK-20250126-006', nombre: 'Validación de Requisitos', proyecto: 'INI-20250126-003', estado: 'Pendiente', prioridad: 'Alta', asignado: 'Sofía López', fechaEntrega: '2025-02-01', sprint: 'SPR-20250126-003', descripcion: 'Validar requisitos con stakeholders' },
    { id: 'TSK-20250126-007', nombre: 'Prototipo Interactivo', proyecto: 'INI-20250126-003', estado: 'En Proceso', prioridad: 'Alta', asignado: 'Diego Torres', fechaEntrega: '2025-02-10', sprint: 'SPR-20250126-003', descripcion: 'Crear prototipo interactivo' },
    { id: 'TSK-20250126-008', nombre: 'Revisión Código', proyecto: 'INI-20250126-001', estado: 'Pendiente', prioridad: 'Media', asignado: 'Juan Pérez', fechaEntrega: '2025-02-03', sprint: 'SPR-20250126-001', descripcion: 'Revisar código de desarrollo' },
    { id: 'TSK-20250126-009', nombre: 'Testing Integración', proyecto: 'INI-20250126-002', estado: 'Pendiente', prioridad: 'Alta', asignado: 'María García', fechaEntrega: '2025-02-08', sprint: 'SPR-20250126-002', descripcion: 'Pruebas de integración' },
    { id: 'TSK-20250126-010', nombre: 'Deploy Staging', proyecto: 'INI-20250126-002', estado: 'En Proceso', prioridad: 'Alta', asignado: 'Carlos Rodríguez', fechaEntrega: '2025-02-15', sprint: 'SPR-20250126-002', descripcion: 'Desplegar en ambiente staging' },
    { id: 'TSK-20250126-011', nombre: 'Capacitación Usuarios', proyecto: 'INI-20250126-002', estado: 'Pendiente', prioridad: 'Media', asignado: 'Ana Martínez', fechaEntrega: '2025-02-20', sprint: 'SPR-20250126-004', descripcion: 'Capacitar usuarios finales' },
    { id: 'TSK-20250126-012', nombre: 'Análisis Datos', proyecto: 'INI-20250126-003', estado: 'Completada', prioridad: 'Media', asignado: 'Luis Fernández', fechaEntrega: '2025-01-22', sprint: 'SPR-20250126-003', descripcion: 'Analizar datos del cliente' },
    { id: 'TSK-20250126-013', nombre: 'Setup CI/CD', proyecto: 'INI-20250126-001', estado: 'En Proceso', prioridad: 'Alta', asignado: 'Sofía López', fechaEntrega: '2025-02-05', sprint: 'SPR-20250126-001', descripcion: 'Configurar pipeline CI/CD' },
    { id: 'TSK-20250126-014', nombre: 'Seguridad', proyecto: 'INI-20250126-002', estado: 'En Proceso', prioridad: 'Alta', asignado: 'Diego Torres', fechaEntrega: '2025-02-12', sprint: 'SPR-20250126-002', descripcion: 'Implementar medidas de seguridad' },
    { id: 'TSK-20250126-015', nombre: 'Performance', proyecto: 'INI-20250126-001', estado: 'Pendiente', prioridad: 'Media', asignado: 'Juan Pérez', fechaEntrega: '2025-02-18', sprint: 'SPR-20250126-001', descripcion: 'Optimizar performance' },
    { id: 'TSK-20250126-016', nombre: 'Backend API', proyecto: 'INI-20250126-003', estado: 'En Proceso', prioridad: 'Alta', asignado: 'María García', fechaEntrega: '2025-02-25', sprint: 'SPR-20250126-003', descripcion: 'Desarrollar backend API' },
    { id: 'TSK-20250126-017', nombre: 'Frontend React', proyecto: 'INI-20250126-001', estado: 'En Proceso', prioridad: 'Alta', asignado: 'Carlos Rodríguez', fechaEntrega: '2025-02-22', sprint: 'SPR-20250126-001', descripcion: 'Desarrollar componentes React' },
    { id: 'TSK-20250126-018', nombre: 'Database Schema', proyecto: 'INI-20250126-002', estado: 'Completada', prioridad: 'Alta', asignado: 'Ana Martínez', fechaEntrega: '2025-01-26', sprint: 'SPR-20250126-002', descripcion: 'Diseñar esquema de base de datos' },
    { id: 'TSK-20250126-019', nombre: 'Monitoreo y Alertas', proyecto: 'INI-20250126-002', estado: 'Pendiente', prioridad: 'Media', asignado: 'Luis Fernández', fechaEntrega: '2025-02-28', sprint: 'SPR-20250126-004', descripcion: 'Configurar monitoreo' },
    { id: 'TSK-20250126-020', nombre: 'Testing UAT', proyecto: 'INI-20250126-003', estado: 'Pendiente', prioridad: 'Alta', asignado: 'Sofía López', fechaEntrega: '2025-03-05', sprint: 'SPR-20250126-005', descripcion: 'Pruebas de aceptación del usuario' },
    { id: 'TSK-20250126-021', nombre: 'Migración de Datos', proyecto: 'INI-20250126-002', estado: 'En Proceso', prioridad: 'Alta', asignado: 'Diego Torres', fechaEntrega: '2025-02-19', sprint: 'SPR-20250126-004', descripcion: 'Migrar datos existentes' },
    { id: 'TSK-20250126-022', nombre: 'Rollback Plan', proyecto: 'INI-20250126-001', estado: 'Pendiente', prioridad: 'Media', asignado: 'Juan Pérez', fechaEntrega: '2025-02-26', sprint: 'SPR-20250126-001', descripcion: 'Crear plan de reversión' },
    { id: 'TSK-20250126-023', nombre: 'Documentación Usuario', proyecto: 'INI-20250126-003', estado: 'Pendiente', prioridad: 'Media', asignado: 'María García', fechaEntrega: '2025-03-01', sprint: 'SPR-20250126-005', descripcion: 'Crear manuales de usuario' },
    { id: 'TSK-20250126-024', nombre: 'Support Producción', proyecto: 'INI-20250126-002', estado: 'Pendiente', prioridad: 'Alta', asignado: 'Carlos Rodríguez', fechaEntrega: '2025-03-10', sprint: 'SPR-20250126-004', descripcion: 'Soporte en producción' },
    { id: 'TSK-20250126-025', nombre: 'Post-Go-Live Review', proyecto: 'INI-20250126-001', estado: 'Pendiente', prioridad: 'Media', asignado: 'Ana Martínez', fechaEntrega: '2025-03-15', sprint: 'SPR-20250126-002', descripcion: 'Revisión post-lanzamiento' },
  ],
  sprints: [
    { id: 'SPR-20250126-001', nombre: 'Sprint 1 - Setup', proyecto: 'INI-20250126-001', fechaInicio: '2025-01-20', fechaFin: '2025-02-03', estado: 'En Curso', objetivo: 'Definición completa del proyecto', tareasCount: 8 },
    { id: 'SPR-20250126-002', nombre: 'Sprint 2 - Development', proyecto: 'INI-20250126-002', fechaInicio: '2025-02-04', fechaFin: '2025-02-18', estado: 'En Curso', objetivo: 'Desarrollo backend y frontend', tareasCount: 7 },
    { id: 'SPR-20250126-003', nombre: 'Sprint 3 - Integration', proyecto: 'INI-20250126-003', fechaInicio: '2025-02-19', fechaFin: '2025-03-05', estado: 'Planeado', objetivo: 'Integración de componentes', tareasCount: 6 },
    { id: 'SPR-20250126-004', nombre: 'Sprint 4 - Testing', proyecto: 'INI-20250126-002', fechaInicio: '2025-03-06', fechaFin: '2025-03-20', estado: 'Planeado', objetivo: 'Testing y validación', tareasCount: 5 },
    { id: 'SPR-20250126-005', nombre: 'Sprint 5 - Launch', proyecto: 'INI-20250126-003', fechaInicio: '2025-03-21', fechaFin: '2025-04-04', estado: 'Planeado', objetivo: 'Preparación y lanzamiento', tareasCount: 4 },
    { id: 'SPR-20250126-006', nombre: 'Sprint 6 - Stabilization', proyecto: 'INI-20250126-001', fechaInicio: '2025-04-05', fechaFin: '2025-04-19', estado: 'Planeado', objetivo: 'Estabilización post-lanzamiento', tareasCount: 3 },
  ]
};

// Definir Tools para Gemini
const tools = [
  {
    name: "getTareas",
    description: "Obtiene todas las tareas del sistema con su estado",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "getIniciativas",
    description: "Obtiene todas las iniciativas activas",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "getSprints",
    description: "Obtiene todos los sprints",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "getEstadisticas",
    description: "Obtiene estadísticas generales (KPIs)",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

// Ejecutar Tools
function executeTool(toolName) {
  switch(toolName) {
    case "getTareas":
      return {
        total: mockData.tareas.length,
        pendientes: mockData.tareas.filter(t => t.estado === 'Pendiente').length,
        tareas: mockData.tareas
      };
    case "getIniciativas":
      return {
        total: mockData.iniciativas.length,
        iniciativas: mockData.iniciativas,
        activas: mockData.iniciativas.filter(i => i.estado === 'Activo').length
      };
    case "getSprints":
      return {
        total: mockData.sprints.length,
        sprints: mockData.sprints
      };
    case "getEstadisticas":
      return {
        totalIniciativas: mockData.iniciativas.length,
        tareasTotal: mockData.tareas.length,
        tareasPendientes: mockData.tareas.filter(t => t.estado === 'Pendiente').length,
        tareasEnProceso: mockData.tareas.filter(t => t.estado === 'En Proceso').length,
        tareasCompletadas: mockData.tareas.filter(t => t.estado === 'Completada').length,
        sprintsEnCurso: mockData.sprints.filter(s => s.estado === 'En Curso').length
      };
    default:
      return { error: "Tool no encontrada" };
  }
}

// Endpoint Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Validación de entrada: message debe ser string no vacío y <= 500 caracteres.
    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'El mensaje es obligatorio y debe ser texto no vacío.'
      });
    }
    if (message.length > 500) {
      return res.status(400).json({
        error: 'El mensaje no puede superar los 500 caracteres.'
      });
    }

    console.log('[Chat] Mensaje recibido');

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.8-flash",
      tools: [{
        functionDeclarations: tools
      }]
    });

    const systemPrompt = `Eres un asistente inteligente para OPI Aceleración.
Respondes preguntas sobre iniciativas, tareas, sprints y estadísticas.
Usa las tools disponibles para acceder a datos reales.
Responde en ESPAÑOL, de forma clara y profesional.`;

    const chat = model.startChat({
      history: []
    });

    // Primera llamada a Gemini
    const response = await chat.sendMessage(message);
    
    let textResponse = "";
    let toolsUsed = [];

    const candidate = response.response.candidates?.[0];

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.text) {
          textResponse = part.text;
        } else if (part.functionCall) {
          const toolName = part.functionCall.name;
          const toolResult = executeTool(toolName);
          toolsUsed.push({ tool: toolName, result: toolResult });

          console.log(`[Tool] Ejecutada: ${toolName}`);

          // Segunda llamada con resultado
          const toolResponse = await chat.sendMessage({
            role: "user",
            parts: [
              {
                functionResponse: {
                  name: toolName,
                  response: toolResult
                }
              }
            ]
          });

          const finalText = toolResponse.response.text();
          if (finalText) {
            textResponse = finalText;
          }
        }
      }
    }

    res.json({
      response: textResponse || "Disculpa, no pude procesar tu solicitud",
      toolsUsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Error]', error.stack);
    res.status(500).json({ 
      error: "Error procesando solicitud"
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] Escuchando en puerto ${PORT}`);
  console.log(`[Gemini] API Key configurada`);
});
