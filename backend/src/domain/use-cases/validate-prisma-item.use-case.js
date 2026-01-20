const PRISMA_VALIDATION_PROMPTS = require('../../config/prisma-validation-prompts');

/**
 * Use Case: Validar Ítem PRISMA con IA (Gatekeeper)
 * 
 * Evalúa el contenido de un ítem contra los criterios estrictos de PRISMA 2020
 * usando Generative AI (Gemini).
 */
class ValidatePrismaItemUseCase {
    constructor({ prismaItemRepository, aiService }) {
        this.prismaItemRepository = prismaItemRepository;
        this.aiService = aiService;
    }

    async execute(projectId, itemNumber, contentOverride = null) {
        try {
            console.log(`🤖 Iniciando validación IA (Gatekeeper) para ítem ${itemNumber}`);

            // 1. Obtener ítem y su contenido actual (o usar override si se previsualiza)
            const item = await this.prismaItemRepository.findByProjectAndNumber(projectId, itemNumber);

            if (!item) {
                throw new Error(`Ítem PRISMA ${itemNumber} no encontrado`);
            }

            const contentToValidate = contentOverride || item.content;

            if (!contentToValidate || contentToValidate.trim().length < 10) {
                return {
                    success: false,
                    validation: {
                        decision: 'RECHAZADO',
                        score: 0,
                        reasoning: 'El contenido es demasiado corto o inexistente para ser evaluado.',
                        issues: ['Contenido vacío o insuficiente'],
                        suggestions: ['Complete el ítem con información detallada.'],
                        criteriaChecklist: {}
                    }
                };
            }

            // 2. Obtener configuración de prompt
            const promptConfig = PRISMA_VALIDATION_PROMPTS[itemNumber];

            if (!promptConfig) {
                throw new Error(`No existe configuración de validación para el ítem ${itemNumber}`);
            }

            // 3. Preparar prompt
            const fullPrompt = promptConfig.validationTemplate.replace('{content}', contentToValidate);

            // 4. Llamar a IA
            console.log(`📡 Consultando a ChatGPT para validación...`);
            const aiResponse = await this.aiService.generateText(
                promptConfig.systemPrompt,
                fullPrompt,
                'chatgpt'
            );

            // 5. Parsear respuesta JSON y sanitizar
            let validationResult;
            try {
                // Intentar extraer JSON si viene envuelto en markdown
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;

                validationResult = JSON.parse(jsonStr);

                // Normalizar decisión (asegurar mayúsculas)
                if (validationResult.decision) {
                    validationResult.decision = validationResult.decision.toUpperCase();
                    // Mapear variantes si la IA alucina
                    if (validationResult.decision.includes('APROBADO')) validationResult.decision = 'APROBADO';
                    else if (validationResult.decision.includes('MEJORA')) validationResult.decision = 'NECESITA_MEJORAS';
                    else if (validationResult.decision.includes('RECHAZADO')) validationResult.decision = 'RECHAZADO';
                }

            } catch (parseError) {
                console.error('❌ Error parseando respuesta de IA:', parseError);
                console.log('Raw response:', aiResponse);
                // Fallback en caso de error de parseo, pero NO aprobar ciegamente
                validationResult = {
                    decision: 'NECESITA_MEJORAS',
                    score: 50,
                    reasoning: 'Error procesando la respuesta de la IA. Por favor intente nuevamente.',
                    issues: ['Error de formato en respuesta IA'],
                    suggestions: ['Reintentar validación'],
                    criteriaChecklist: {}
                };
            }

            console.log(`✅ Resultado validación: ${validationResult.decision} (Score: ${validationResult.score})`);

            // 6. Si no es previsualización (no contentOverride), guardar resultado en DB
            if (!contentOverride) {
                await this.prismaItemRepository.updateAIValidation(
                    projectId,
                    itemNumber,
                    validationResult
                );

                // Si fue APROBADO, asegurar que completed = true
                if (validationResult.decision === 'APROBADO') {
                    await this.prismaItemRepository.markAsCompleted(projectId, itemNumber);
                }
            }

            return {
                success: true,
                validation: validationResult
            };

        } catch (error) {
            console.error('❌ Error en use case ValidatePrismaItem:', error);
            throw error;
        }
    }
}

module.exports = ValidatePrismaItemUseCase;
