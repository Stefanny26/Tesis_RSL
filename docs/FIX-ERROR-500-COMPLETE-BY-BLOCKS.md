# FIX: Error 500 en `/complete-by-blocks` (Producción)

**Fecha**: 27 de Enero, 2026  
**Error**: `Failed to load resource: the server responded with a status of 500 ()`  
**Endpoint**: `POST /api/projects/:projectId/prisma/complete-by-blocks`

---

## 🔴 Descripción del Problema

Al intentar pasar del **cribado al artículo**, el sistema ejecuta un autocompletado de ítems PRISMA que falla con error 500.

**Flujo:**
1. ✅ Cribado completa correctamente (27 referencias procesadas)
2. ✅ Se seleccionan 7 para revisión, 20 auto-excluidas
3. ❌ Al hacer clic en "Continuar al Artículo" → Error 500 en `complete-by-blocks`
4. ❌ No redirige a la vista del artículo

**Logs del frontend:**
```javascript
complete-by-blocks:1   Failed to load resource: the server responded with a status of 500 ()
❌ Error completo: Error: Error al completar bloques PRISMA
    at r.request (855-999ab462f81a3aef.js:1:784)
    at async r.completePrismaByBlocks (855-999ab462f81a3aef.js:1:12924)
```

---

## 🔍 Causas Posibles

### 1. **API Key de OpenAI no configurada en producción** (MÁS PROBABLE)

El método `completeByBlocks` usa `AIService` que requiere OpenAI o Gemini API keys.

**Archivo:** `backend/src/domain/use-cases/complete-prisma-by-blocks.use-case.js` (línea 91)
```javascript
const aiResponse = await this.aiService.generateText(systemPrompt, userPrompt, 'chatgpt');
```

Si `OPENAI_API_KEY` no está configurada en las variables de entorno de producción:
- El servicio falla al instanciarse
- Retorna error 500
- No hay fallback configurado

### 2. **Límite de tokens excedido**

El prompt académico para completar PRISMA puede ser muy largo si hay muchas referencias:
- Contexto PRISMA completo (protocolo + referencias + RQS)
- Límite actual: `max_tokens: 2500` (línea 142 de `ai.service.js`)
- Si el contexto supera el límite → Error

### 3. **Timeout de la API**

Las llamadas a OpenAI pueden tardar 10-30 segundos con contextos largos.
- Vercel tiene timeout de 10s en plan gratuito (ahora estás en producción)
- Render.com tiene timeout de 30s por defecto
- Si excede → Error 504/500

### 4. **Falta inicializar ítems PRISMA**

El método `processBlock` asume que los ítems PRISMA ya existen en la base de datos:
```javascript
await this.prismaItemRepository.updateItemContent(projectId, itemNumber, content);
```

Si los 27 ítems no se crearon previamente con `generate-prisma-items` → Error al intentar actualizar un ítem inexistente.

---

## ✅ Soluciones

### Solución 1: Verificar Variables de Entorno en Producción

**Paso 1:** Verificar que las API keys estén configuradas en tu plataforma de hosting

**Si estás en Vercel:**
```bash
# Ir a: https://vercel.com/tu-proyecto/settings/environment-variables
# Verificar que existan:
OPENAI_API_KEY=sk-...
# O alternativamente:
GEMINI_API_KEY=AIza...
```

**Si estás en Render:**
```bash
# Ir a: Dashboard → Backend Service → Environment
# Verificar variables de entorno
OPENAI_API_KEY=sk-...
```

**Paso 2:** Re-deployar el backend después de agregar las variables

### Solución 2: Agregar Manejo de Errores Mejorado

Editar `backend/src/api/controllers/prisma.controller.js` línea 538:

```javascript
async completeByBlocks(req, res) {
  try {
    const { projectId } = req.params;
    const { block = 'all' } = req.body;

    // Verificar permisos
    const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para completar ítems PRISMA'
      });
    }

    // 🔧 FIX: Verificar que los ítems PRISMA existan
    const items = await this.prismaItemRepository.getByProject(projectId);
    if (!items || items.length === 0) {
      console.log('⚠️ No hay ítems PRISMA, generándolos primero...');
      // Generar los 27 ítems vacíos
      await this.generatePrismaItems(projectId);
    }

    // Validar bloque
    const validBlocks = ['all', 'methods', 'results', 'discussion', 'other'];
    if (!validBlocks.includes(block)) {
      return res.status(400).json({
        success: false,
        message: `Bloque inválido. Debe ser uno de: ${validBlocks.join(', ')}`
      });
    }

    // 🔧 FIX: Verificar que AI Service esté disponible
    const aiService = new AIService(req.userId);
    if (!aiService.openai && !aiService.gemini) {
      return res.status(503).json({
        success: false,
        message: 'Servicio de IA no disponible. Contacta al administrador.',
        details: 'API keys no configuradas'
      });
    }

    // Crear use case
    const generateContextUseCase = new GeneratePrismaContextUseCase({
      protocolRepository: this.protocolRepository,
      referenceRepository: this.referenceRepository,
      projectRepository: this.projectRepository
    });

    const completeByBlocksUseCase = new CompletePrismaByBlocksUseCase({
      prismaItemRepository: this.prismaItemRepository,
      protocolRepository: this.protocolRepository,
      aiService: aiService,
      generatePrismaContextUseCase: generateContextUseCase
    });

    const result = await completeByBlocksUseCase.execute(projectId, block);

    res.status(200).json({
      success: true,
      data: result,
      message: `Bloques ${block} completados exitosamente`
    });

  } catch (error) {
    console.error('❌ Error completando bloques PRISMA:', error);
    
    // 🔧 FIX: Más detalles en el error
    let errorMessage = 'Error al completar bloques PRISMA';
    let statusCode = 500;
    
    if (error.message.includes('API key')) {
      errorMessage = 'Servicio de IA no configurado correctamente';
      statusCode = 503;
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Tiempo de espera excedido. Intenta con un bloque específico.';
      statusCode = 504;
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Límite de uso de IA excedido. Intenta en unos minutos.';
      statusCode = 429;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// 🔧 FIX: Método auxiliar para generar ítems
async generatePrismaItems(projectId) {
  const items = [];
  for (let i = 1; i <= 27; i++) {
    items.push({
      project_id: projectId,
      item_number: i,
      content: '',
      ai_status: 'pending',
      is_unlocked: i === 1
    });
  }
  
  for (const item of items) {
    await this.prismaItemRepository.create(item);
  }
  
  console.log(`✅ ${items.length} ítems PRISMA generados para proyecto ${projectId}`);
}
```

### Solución 3: Aumentar Límite de Tokens

Editar `backend/src/infrastructure/services/ai.service.js` línea 142:

```javascript
const completion = await this.openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: userPrompt
    }
  ],
  temperature: 0.3,
  max_tokens: 4000  // ← Aumentado de 2500 a 4000
});
```

### Solución 4: Implementar Completado por Bloques Individual

Si el timeout persiste, cambiar la estrategia del frontend para llamar bloques individualmente en lugar de `block: 'all'`:

**Frontend:** `frontend/app/projects/[id]/screening/page.tsx` (aproximadamente)

```typescript
const handleContinueToArticle = async () => {
  try {
    setIsCompletingPrisma(true);
    
    // En lugar de completar todo de una vez:
    // await apiClient.completePrismaByBlocks(projectId, { block: 'all' });
    
    // Completar por bloques secuencialmente:
    const blocks = ['methods', 'results', 'discussion', 'other'];
    
    for (const block of blocks) {
      console.log(`📝 Completando bloque: ${block}`);
      await apiClient.completePrismaByBlocks(projectId, { block });
      // Pequeña pausa entre bloques
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    toast.success('✅ Ítems PRISMA autocompletados');
    router.push(`/projects/${projectId}/article`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    toast.error('Error al completar PRISMA. Intenta manualmente.');
  } finally {
    setIsCompletingPrisma(false);
  }
};
```

### Solución 5: Agregar Endpoint de Fallback Manual

Crear una ruta alternativa que no use IA para casos de emergencia:

**Backend:** `backend/src/api/routes/prisma.routes.js`

```javascript
/**
 * POST /api/projects/:projectId/prisma/skip-completion
 * Saltar autocompletado y crear ítems vacíos
 */
router.post(
  '/:projectId/prisma/skip-completion',
  authMiddleware,
  (req, res) => prismaController.skipCompletion(req, res)
);
```

**Backend:** `backend/src/api/controllers/prisma.controller.js`

```javascript
async skipCompletion(req, res) {
  try {
    const { projectId } = req.params;
    
    const isOwner = await this.projectRepository.isOwner(projectId, req.userId);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso'
      });
    }
    
    // Generar 27 ítems vacíos si no existen
    let items = await this.prismaItemRepository.getByProject(projectId);
    
    if (!items || items.length === 0) {
      for (let i = 1; i <= 27; i++) {
        await this.prismaItemRepository.create({
          project_id: projectId,
          item_number: i,
          content: '',
          ai_status: 'pending',
          is_unlocked: true  // Desbloquear todos
        });
      }
      
      items = await this.prismaItemRepository.getByProject(projectId);
    }
    
    res.status(200).json({
      success: true,
      message: 'Ítems PRISMA listos para edición manual',
      items: items.length
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
```

---

## 🧪 Cómo Probar la Solución

### Test 1: Verificar API Keys

```bash
# En el servidor de producción
echo $OPENAI_API_KEY
# Debe mostrar: sk-...

# O desde Node.js
node -e "console.log(process.env.OPENAI_API_KEY)"
```

### Test 2: Probar Endpoint Directamente

```bash
# Obtener token JWT del frontend (desde DevTools Console):
localStorage.getItem('token')

# Hacer request manual:
curl -X POST https://tu-backend.com/api/projects/PROJECT_ID/prisma/complete-by-blocks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"block": "methods"}'
```

### Test 3: Logs del Backend

```bash
# Ver logs en tiempo real (Render):
# Dashboard → tu-backend → Logs

# Buscar mensajes:
# ✅ "OpenAI inicializado correctamente"
# ❌ "OpenAI API key no configurada"
```

---

## 📋 Checklist de Verificación

- [ ] Variables de entorno configuradas en producción (`OPENAI_API_KEY` o `GEMINI_API_KEY`)
- [ ] Backend re-deployado después de agregar variables
- [ ] Logs del backend muestran "✅ OpenAI inicializado correctamente"
- [ ] Ítems PRISMA se crean automáticamente al inicio del proyecto
- [ ] Timeout de hosting permite > 30 segundos para requests largos
- [ ] Frontend maneja errores 500/503 con mensajes claros al usuario

---

## 🚀 Solución Rápida (5 minutos)

**Si estás con prisa y necesitas que funcione YA:**

1. **Agregar API Key en Vercel/Render:**
   - Vercel: Settings → Environment Variables → Add `OPENAI_API_KEY`
   - Render: Environment → Add `OPENAI_API_KEY=sk-...`

2. **Re-deploy:**
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push origin main
   ```

3. **Esperar 2-3 minutos** a que el deploy termine

4. **Probar de nuevo** el flujo completo

---

## 📞 Si el problema persiste

1. Revisar logs completos del backend en producción
2. Verificar límites de uso de OpenAI (https://platform.openai.com/usage)
3. Verificar que el plan de hosting permite requests > 30s
4. Contactar soporte de la plataforma de hosting

---

**Elaborado por**: GitHub Copilot  
**Para**: Stefanny Mishel Hernández Buenaño  
**Proyecto**: Tesis RSL System - ESPE 2026
