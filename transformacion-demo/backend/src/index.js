import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://opiaceleracion.vercel.app',
      'https://opiaceleracion-kkhmaa9pw-eacu.vercel.app'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Mock Data (igual que frontend)
const mockData = {
  iniciativas: [
    { id: 'INI-001', nombre: 'Portal Web', etapa: 'DELIVERY ENGINE', empresa: 'Davivienda', progreso: 75 },
    { id: 'INI-002', nombre: 'App Móvil', etapa: 'PROJECT SETUP', empresa: 'Seguros Bolívar', progreso: 45 },
    { id: 'INI-003', nombre: 'Dashboard Analytics', etapa: 'CONCEPT STUDIO', empresa: 'Constructora Bolívar', progreso: 30 },
  ],
  tareas: [
    { id: 'TSK-001', nombre: 'Diseñar UI', estado: 'Pendiente', prioridad: 'Alta' },
    { id: 'TSK-002', nombre: 'Revisar código', estado: 'En Progreso', prioridad: 'Media' },
    { id: 'TSK-003', nombre: 'Testing', estado: 'Completada', prioridad: 'Alta' },
  ],
  sprints: [
    { id: 'SPR-001', nombre: 'Sprint 1', estado: 'Activo', progreso: 80 },
    { id: 'SPR-002', nombre: 'Sprint 2', estado: 'Pendiente', progreso: 0 },
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
        promedioProg: Math.round(
          mockData.iniciativas.reduce((acc, i) => acc + i.progreso, 0) / mockData.iniciativas.length
        )
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
        sprintsActivos: mockData.sprints.filter(s => s.estado === 'Activo').length
      };
    default:
      return { error: "Tool no encontrada" };
  }
}

// Endpoint Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;

    console.log(`[Chat] Usuario: ${userId}, Mensaje: ${message}`);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
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

    for (const content of response.response.content) {
      if (content.parts) {
        for (const part of content.parts) {
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

            if (toolResponse.response.text) {
              textResponse = toolResponse.response.text;
            }
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
    console.error('[Error]', error);
    res.status(500).json({ 
      error: "Error procesando solicitud",
      message: error.message 
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
