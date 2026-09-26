# 🚀 Quick Start - OPI 2026 Transformación Demo

## 5 Minutos para Empezar

### Paso 1: Instalar Dependencias
```bash
cd transformacion-demo
npm install
```

### Paso 2: Ejecutar Desarrollo
```bash
npm run dev
```

### Paso 3: Abrir en Navegador
```
http://localhost:3000
```

### Paso 4: Login
- **Email**: `eddy.cifuentes@segurosbolivar.com`
- **Password**: `password`

✅ **Listo para explorar**

---

## 📱 Explora las Secciones

### 1️⃣ Dashboard
- 4 KPIs principales
- 3 gráficos interactivos
- Resumen ejecutivo

Ruta: `http://localhost:3000/#/dashboard`

### 2️⃣ Iniciativas
- 8 iniciativas con tarjetas
- Búsqueda por nombre
- Filtros: Empresa, Etapa
- Modales: Detalle, Editar, Cambiar Etapa

Ruta: `http://localhost:3000/#/iniciativas`

### 3️⃣ Tareas
- 25 tareas en tabla
- Columnas: ID, Nombre, Proyecto, Estado, Prioridad, Asignado, Fecha
- Filtros: Proyecto, Estado, Asignado
- Modales: Detalle, Cambiar Estado

Ruta: `http://localhost:3000/#/tareas`

### 4️⃣ Sprints
- 6 sprints en grid
- Información: Proyecto, Período, Objetivo, Tareas
- Modales: Detalle con tareas, Editar

Ruta: `http://localhost:3000/#/sprints`

### 5️⃣ Reportes
- Resumen ejecutivo
- Tabla de KPIs
- Top 3 iniciativas críticas
- Carga por persona

Ruta: `http://localhost:3000/#/reportes`

---

## 🎨 Interactividad

### Filtros
- Todos los filtros funcionan en **tiempo real**
- Búsqueda por nombre o ID
- Combinación de múltiples filtros

### Modales
- Click en "Ver Detalle" → Abre modal
- Click en "Editar" → Edita campos
- Click en "X" o fuera → Cierra modal

### Cambios
- Click "Cambiar Etapa" → Cambiar etapa de iniciativa
- Click "Cambiar Estado" → Cambiar estado de tarea
- Click "Guardar" → Persiste en memoria

---

## 🎨 Colores

| Color | Uso |
|-------|-----|
| 🔵 Azul | Primario |
| ⚫ Gris | Secundario |
| 🟢 Verde | Éxito/Completado |
| 🟡 Amarillo | Advertencia/En Proceso |
| 🔴 Rojo | Peligro/Pendiente |

---

## 💾 Datos

### Mock Data Incluida
- ✅ 8 Iniciativas
- ✅ 25 Tareas
- ✅ 6 Sprints
- ✅ Datos realistas y coherentes

### Persistencia
- ✅ Autenticación guardada en localStorage
- ✅ Cambios en memoria durante sesión
- ✅ Se resetea al recargar (excepto auth)

---

## 🛠️ Build & Deploy

### Compilar para Producción
```bash
npm run build
```

### Preview Build Local
```bash
npm run preview
```

### Deployment a Vercel
1. Push código a GitHub
2. Conectar repositorio en Vercel
3. Deploy automático

---

## 📁 Estructura Rápida

```
src/
├── pages/           # 6 páginas (Dashboard, Iniciativas, etc.)
├── components/      # 10 componentes reutilizables
├── store/          # 4 stores Zustand
└── data/           # Mock data completa
```

---

## ❓ Preguntas Frecuentes

### ¿Dónde está el backend?
No hay backend. Es un prototipo frontend puro con datos mock en memoria.

### ¿Cómo agrego mis datos?
Edita `src/data/mockData.ts` con tus datos reales.

### ¿Es seguro para producción?
Es un prototipo demo. Para producción, integra un backend real con API.

### ¿Funciona offline?
Sí, completamente offline. Todo está en el cliente.

### ¿Puedo agregar más iniciativas/tareas?
Sí, edita `mockData.ts` o implementa un formulario de creación.

---

## 🐛 Troubleshooting

### Puerto 3000 ocupado
```bash
npm run dev -- --port 3001
```

### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build error
```bash
npm run build
# Si sigue fallando:
rm -rf dist
npm run build
```

---

## 📚 Documentación

- `README.md` - Documentación completa
- `PROJECT_STRUCTURE.md` - Estructura detallada
- `VALIDATION_REPORT.md` - Reporte de validación

---

## 🎯 Próximos Pasos

1. **Explorar la interfaz** - 5 minutos
2. **Probar filtros** - 2 minutos
3. **Abrir modales** - 3 minutos
4. **Revisar gráficos** - 2 minutos
5. **Check reportes** - 3 minutos

**Total**: 15 minutos para conocer toda la app 🎉

---

## 💬 Tips

- 💡 Los filtros son muy rápidos, prueba combinarlos
- 💡 Los gráficos son interactivos, pasa mouse encima
- 💡 Todos los botones hacen clic, prueba varios
- 💡 El logout limpia la sesión, debes volver a login
- 💡 Los datos mock son realistas, muy similar a producción

---

## ✅ Checklist

- [ ] Instalar dependencias
- [ ] Ejecutar `npm run dev`
- [ ] Abrir en navegador
- [ ] Login con email demo
- [ ] Explorar Dashboard
- [ ] Probar Iniciativas
- [ ] Revisar Tareas
- [ ] Ver Sprints
- [ ] Leer Reportes
- [ ] Probar filtros
- [ ] Abrir modales
- [ ] Cambiar estados

---

**¡Bienvenido a OPI 2026 Transformación Demo!** 🚀

*Creado con React, TypeScript, Tailwind y ❤️*
