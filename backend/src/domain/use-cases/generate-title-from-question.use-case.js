const OpenAI = require('openai');

/**
 * Caso de uso: Generar título basado en pregunta de investigación
 * Utiliza IA para concretar un título académico a partir de la pregunta
 */
class GenerateTitleFromQuestionUseCase {
  constructor() {
    // Inicializar OpenAI/ChatGPT
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  async execute({ researchQuestion, aiProvider = 'chatgpt' }) {
    if (!researchQuestion) {
      throw new Error('Pregunta de investigación es requerida');
    }

    if (!this.openai) {
      throw new Error('No hay proveedor de IA configurado');
    }

    const prompt = this.buildPrompt(researchQuestion);

    try {
      const result = await this.generateWithChatGPT(prompt);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error generando título:', error);
      throw new Error(`Error al generar título: ${error.message}`);
    }
  }

  buildPrompt(researchQuestion) {
    return `Eres un experto en metodología de investigación académica y revisiones sistemáticas siguiendo estándares Cochrane y PRISMA.

**PREGUNTA DE INVESTIGACIÓN:**
${researchQuestion}

**TU TAREA:**
Generar títulos académicos apropiados para una Revisión Sistemática de Literatura (SLR) basados en esta pregunta de investigación.

**RESPONDE EN FORMATO JSON:**

{
  "titulo_ingles": "Título principal en inglés siguiendo formato: [Technology/Concept] in [Context]: A Systematic Literature Review on [Key Aspects]",
  "titulo_espanol": "Título en español equivalente",
  "titulo_corto": "Versión corta del título (máximo 100 caracteres)",
  "subtitulos_alternativos": [
    "Alternativa 1 en inglés",
    "Alternativa 2 en inglés",
    "Alternativa 3 en inglés"
  ],
  "justificacion": "Explicación de por qué este título captura la esencia de la pregunta de investigación",
  "elementos_clave": {
    "tecnologia_concepto": "Tecnología o concepto principal",
    "contexto": "Contexto de aplicación",
    "aspectos_clave": ["aspecto1", "aspecto2", "aspecto3"]
  }
}

**CRITERIOS:**
1. El título debe ser claro, conciso y descriptivo
2. Debe incluir las palabras clave principales de la pregunta
3. Debe seguir el formato académico estándar para SLR
4. Debe ser atractivo pero profesional
5. No debe exceder 150 caracteres (sin contar el subtítulo)

Responde SOLO con JSON válido, sin texto adicional.`;
  }

  async generateWithChatGPT(prompt) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un experto en títulos académicos para revisiones sistemáticas. Respondes en formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }
}

module.exports = GenerateTitleFromQuestionUseCase;

