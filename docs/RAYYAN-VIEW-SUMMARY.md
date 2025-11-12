# 📖 Interfaz de Cribado Estilo Rayyan

## ✅ Implementación Completada

### Lo que se creó:

1. **Tab "Revisión Estilo Rayyan"** en la página de Cribado
   - Vista de artículo completo (uno a la vez)
   - Navegación secuencial entre artículos
   - Solo muestra artículos con estado "pending"

2. **Componente RayyanIntegration** (`frontend/components/screening/rayyan-integration.tsx`)
   - 370 líneas de código funcional
   - Vista detallada de cada artículo
   - Botones de decisión visual
   - Sistema de progreso

---

## 🎯 Características Principales

### 1. Vista de Artículo Completo
```
┌────────────────────────────────────────┐
│ Progreso: ████░░░░ 50% (10/20)        │
├────────────────────────────────────────┤
│ [← Anterior]  10/20  [Siguiente →]    │
├────────────────────────────────────────┤
│                                        │
│ TÍTULO DEL ARTÍCULO                   │
│ 👤 Autores: ...                       │
│ 📅 Año: 2024                          │
│ 📚 Fuente: IEEE                       │
│                                        │
│ 📄 Resumen                            │
│ ┌────────────────────────────────┐   │
│ │ Texto completo del resumen...  │   │
│ └────────────────────────────────┘   │
│                                        │
│ 🔗 DOI: 10.xxx/xxx                   │
│                                        │
│ 💬 Notas                              │
│ ┌────────────────────────────────┐   │
│ │ [Escribe notas aquí...]        │   │
│ └────────────────────────────────┘   │
│                                        │
├────────────────────────────────────────┤
│ [✓ Incluir] [? Revisar] [✗ Excluir] │
└────────────────────────────────────────┘
```

### 2. Barra de Progreso
- **Visual**: Barra de progreso animada
- **Contador**: "34 de 50 revisados"
- **Estadísticas detalladas**:
  - 🟢 15 incluidos
  - 🔴 12 excluidos
  - 🟡 7 por revisar

### 3. Navegación
- **Botones**: Anterior/Siguiente
- **Atajos de teclado**:
  - `←` Artículo anterior
  - `→` Artículo siguiente
  - `I` Incluir
  - `E` Excluir
  - `M` o `?` Marcar para revisar
- **Auto-avance**: Después de tomar decisión

### 4. Metadatos Mostrados
- ✅ Título del artículo
- ✅ Lista de autores
- ✅ Año de publicación
- ✅ Fuente/Base de datos
- ✅ Resumen completo
- ✅ DOI (si existe)
- ✅ Estado actual

### 5. Botones de Decisión
```typescript
[✓ Incluir]
Relevante para la revisión
Color: Verde (bg-green-600)

[? Revisar después]
Necesita más análisis
Color: Amarillo (border-yellow-500)

[✗ Excluir]
No cumple criterios
Color: Rojo (bg-red-600)
```

### 6. Campo de Notas
- Textarea para cada artículo
- Guarda notas localmente
- Persistirá cuando se conecte al backend

---

## 🔄 Flujo de Usuario

1. **Entrar a Cribado**
   ```
   Proyectos → [Tu Proyecto] → Cribado
   ```

2. **Cambiar a Vista Rayyan**
   ```
   Click en tab: "Revisión Estilo Rayyan"
   ```

3. **Ver Primer Artículo**
   - Se muestra solo si tiene status = "pending"
   - Vista completa del artículo

4. **Leer Resumen**
   - Scroll para leer todo el resumen
   - Ver metadatos relevantes

5. **Tomar Decisión**
   - Click en botón (o usar atajo)
   - Se marca con badge de color
   - Automáticamente avanza al siguiente

6. **Añadir Notas (Opcional)**
   - Escribir justificación
   - Se guarda con la decisión

7. **Repetir hasta Completar**
   - Contador muestra progreso
   - Al terminar: mensaje de finalización

---

## 💾 Estado Actual

### ✅ Funcional
- Navegación entre artículos
- Mostrar contenido completo
- Botones de decisión
- Progreso visual
- Atajos de teclado
- Campo de notas
- Auto-avance

### ⚠️ Pendiente (Backend)
- Guardar decisiones en base de datos
- Persistir notas
- Actualizar contador de stats
- Endpoint: `PUT /api/references/:id/decision`

---

## 🎨 Diseño Visual

### Colores por Decisión
- **Incluido**: Verde (#16a34a)
- **Excluido**: Rojo (#dc2626)
- **Revisar**: Amarillo (#eab308)

### Badges de Estado
```tsx
// Incluido
<Badge className="bg-green-50 text-green-700 border-green-200">
  ✓ Incluido
</Badge>

// Excluido
<Badge className="bg-red-50 text-red-700 border-red-200">
  ✗ Excluido
</Badge>

// Por revisar
<Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
  ? Por revisar
</Badge>
```

### Iconos Usados
- 📚 `BookOpen` - Fuente
- 👤 `User` - Autores
- 📅 `Calendar` - Año
- 📄 `FileText` - Resumen/Estado
- 🔗 `LinkIcon` - DOI
- 💬 `MessageSquare` - Notas
- ✓ `CheckCircle2` - Incluir
- ✗ `XCircle` - Excluir
- ? `HelpCircle` - Revisar
- ← `ChevronLeft` - Anterior
- → `ChevronRight` - Siguiente

---

## 🚀 Para Probar

### 1. Acceder a la Interfaz
```
http://localhost:3000/projects/[project-id]/screening
```

### 2. Cambiar a Tab Rayyan
Click en: **"Revisión Estilo Rayyan"**

### 3. Navegar
- Usar botones o flechas del teclado
- Leer resumen completo

### 4. Tomar Decisiones
- Click en botones o usar atajos (I/E/M)
- Ver cómo avanza automáticamente

### 5. Verificar Progreso
- Barra de progreso se actualiza
- Contador muestra revisados/total

---

## 📊 Comparación con Tabla

### Interfaz de Tabla (Cribado Manual)
✅ Ver múltiples artículos a la vez
✅ Seleccionar varios y aplicar acción
✅ Filtros y búsqueda
✅ Panel IA

### Interfaz Rayyan (Nueva)
✅ Lectura enfocada (uno a la vez)
✅ Vista completa del resumen
✅ Navegación secuencial
✅ Atajos de teclado
✅ Notas por artículo
✅ Progreso visual

**Uso recomendado:**
- **Tabla**: Cuando tienes criterios claros y puedes decidir rápido
- **Rayyan**: Cuando necesitas leer resúmenes completos para decidir

---

## 🔌 Integración Backend

### Endpoint Necesario
```javascript
PUT /api/references/:id/decision

Body: {
  decision: 'included' | 'excluded' | 'maybe',
  notes: string (opcional)
}

Response: {
  id: string,
  status: string,
  notes: string,
  updatedAt: Date
}
```

### Actualización en Componente
```typescript
// En handleDecision()
const response = await apiClient.updateReferenceDecision(
  currentReference.id,
  {
    decision,
    notes: currentNote.trim() || undefined
  }
)

// Actualizar estado local
onSyncComplete() // Recargar referencias
```

---

## ✨ Mejoras Futuras

### Corto Plazo
- [ ] Conectar con backend (guardar decisiones)
- [ ] Persistir notas en BD
- [ ] Historial de cambios
- [ ] Exportar decisiones

### Mediano Plazo
- [ ] Filtros por decisión anterior
- [ ] Búsqueda dentro de Rayyan View
- [ ] Resaltar palabras clave del PICO
- [ ] Modo comparación (dos artículos lado a lado)

### Largo Plazo
- [ ] Cribado colaborativo (múltiples revisores)
- [ ] Resolución de conflictos
- [ ] Comentarios entre revisores
- [ ] Estadísticas de acuerdo inter-evaluador (Kappa)

---

## 📝 Resumen

**Lo que tienes ahora:**
- ✅ Tab adicional en Cribado
- ✅ Vista estilo Rayyan (artículo completo)
- ✅ Navegación secuencial
- ✅ Botones de decisión visual
- ✅ Progreso en tiempo real
- ✅ Atajos de teclado
- ✅ Campo de notas
- ✅ 100% funcional en UI

**Lo que falta:**
- ⚠️ Conexión backend para persistir decisiones
- ⚠️ Actualizar stats después de decisión

**Archivos creados/modificados:**
1. `frontend/app/projects/[id]/screening/page.tsx` - Agregado tab
2. `frontend/components/screening/rayyan-integration.tsx` - Componente nuevo (370 líneas)
3. `docs/RAYYAN-INTEGRATION.md` - Documentación actualizada

---

**¡Listo para usar! 🎉**

Navega a la sección de Cribado y prueba el nuevo tab "Revisión Estilo Rayyan".
