# JTBD Analysis - OPI Aceleración

## Clase 1: Jobs to be Done

### Job 1: "Ver estado de TODAS mis iniciativas en 1 pantalla"

**Usuario:** Gestor de innovación  

**Actual:** Abrir Sheets, buscar manualmente, ver números  

**Deseado:** Dashboard con KPIs automáticos + gráficos  

**Demo muestra:** DashboardPage con 4 KPIs + 3 visualizaciones  

### Job 2: "Crear iniciativa sin hacer 10 clics"

**Usuario:** Gerente de proyecto  

**Actual:** Crear en Sheets + crear carpeta Drive + email a admin  

**Deseado:** Modal "Nueva Iniciativa" → llenar 5 campos → Listo  

**Demo muestra:** IniciativasPage con modal CRUD funcional  

### Job 3: "Cambiar etapa sin llamar a admin"

**Usuario:** Gestor  

**Actual:** Cambiar en Sheets + email explicando cambio  

**Deseado:** Modal "Cambiar Etapa" + campo "Motivo" → automático  

**Demo muestra:** Modal con 6 etapas OPI + historial  

### Job 4: "Ver MIS tareas de HOY"

**Usuario:** Ejecutor  

**Actual:** Buscar en Tareas sheet, scroll manual  

**Deseado:** Vista filtrada, ordenada, prioritaria  

**Demo muestra:** TareasPage con filtros por estado, fecha  

### Job 5: "Saber qué tareas lleva CADA sprint"

**Usuario:** Scrum master  

**Actual:** Buscar en Tareas sheet manualmente  

**Deseado:** Click Sprint → tabla tareas → listo  

**Demo muestra:** SprintsPage con grid de sprints + detalle  

---

## Mapeo Jobs → Interfaces

| Job | Interfaz | Funcionalidad |
|-----|----------|-------------|
| 1 | Dashboard | KPIs + gráficos |
| 2 | Iniciativas | Modal crear, editar, eliminar |
| 3 | Modal Etapa | Cambio + registro motivo |
| 4 | Tareas | Filtros + búsqueda |
| 5 | Sprints | Grid + detalle con tareas |

---

## Diferencia: Feature-driven vs JTBD

**Feature-driven (malo):**

"Agreguemos gráficos" → ¿Para qué?

**JTBD (correcto):**

"Usuario necesita VER rápido" → Gráficos es la solución

En este proyecto: Aplicamos JTBD en cada pantalla.
