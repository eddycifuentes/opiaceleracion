# Justificación de Skills - Curso Vibe Coding

## Clases 1-5 Aplicadas en OPI Aceleración

### Clase 1: JTBD (Jobs to be Done)

**Skill:** Entender QUÉ hace usuario, no QUÉ construir  

**Dónde:** `docs/JTBD_ANALYSIS.md`  

**Evidencia:**

- Identificamos 5 jobs del usuario

- Diseñamos interfaces directas al job (no features aleatorias)

- Resultado: Dashboard/Modal/Tareas/Sprints específicos al job

---

### Clase 2: Arquitectura Aislada

**Skill:** Módulos independientes (no mega-código)  

**Dónde:** Estructura carpetas `src/store/`, `src/components/`, `src/pages/`  

**Evidencia:**

- 4 Zustand stores independientes (auth, iniciativas, tareas, sprints)

- 10+ componentes reutilizables

- 6 páginas independientes

- Si 1 módulo falla, otros funcionan

---

### Clase 3: Autenticación simulada (Clerk planeado, no implementado)

**Skill:** Autenticación ≠ Autorización  

**Dónde:** `src/pages/LoginPage.tsx` + `src/store/authStore.tsx`  

**Evidencia:**

- Autenticación simulada (demo): `login()` ignora la contraseña y acepta cualquier valor

- Estado de sesión persistido en localStorage (sin JWT ni validación real)

- Clerk estaba planeado pero no está implementado (sin dependencia ni integración)

---

### Clase 4: Repomix + Firecrawl + Demo Ejecutiva

**Skill 1 - Repomix:**  

Documentar código → facilita contexto  

**Skill 2 - Firecrawl:**  

Prompts optimizados (sin verbosidad) = generación más rápida  

**Skill 3 - Demo ejecutiva:**  

Problema → Solución → Impacto  

---

### Clase 5: Logging + Error Handling + .env + Tests

**Skill 1 - Logging explícito:**  

`Logger.info()` + `Logger.error()` en CADA función de store (`src/store/*.tsx`)  

**NO:** Errores silenciosos  

**SÍ:** Cada acción registrada en console  

**Skill 2 - Error handling:**  

Try/catch con mensajes claros  

Usuario entiende QUÉ falló, NO "undefined is not a function"  

**Skill 3 - Variables .env:**  

`.env.example` → `.env.local` en desarrollo  

Seguridad: No expone keys en repo  

Escalabilidad: Desarrollo ≠ Producción  

**Skill 4 - Tests:**  

6 tests críticos validando mockData  

`npm test` → todos pasan  

Valida: estructura, campos requeridos  

---

## Resumen: Skills Aplicados

| Clase | Skill | Evidencia | Archivo |
|-------|-------|-----------|---------|
| 1 | JTBD | 5 jobs identificados | JTBD_ANALYSIS.md |
| 2 | Arquitectura aislada | 4 stores + 10 componentes | src/store/, src/components/ |
| 3 | Auth simulada (Clerk planeado, no implementado) | LoginPage + authStore (localStorage) | src/pages/LoginPage.tsx |
| 4 | Repomix | Código documentado | CODE_SNAPSHOT.md |
| 4 | Firecrawl | Prompts optimizados | Estructura proyecto |
| 4 | Demo ejecutiva | 5 min: problema→solución | Presentación |
| 5 | Logging | Logger.info/error | src/store/*.tsx |
| 5 | Error handling | Try/catch explícito | src/store/*.tsx |
| 5 | .env | .env.example + .env.local | .env.example |
| 5 | Tests | 6 tests pasando | **tests**/mockData.test.ts |

---

## Conclusión

Este NO es solo un "demo".  

Es **aplicación real de metodología Vibe Coding**.

Cada skill tiene evidencia en código.
