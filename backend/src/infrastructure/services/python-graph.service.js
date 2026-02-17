const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class PythonGraphService {
    constructor() {
        this.scriptPath = path.join(__dirname, '../../../scripts/generate_charts.py');
        this.outputDir = path.join(__dirname, '../../../uploads/charts');

        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Genera gráficos PRISMA y Scree Plot usando Python
     * @param {Object} prismaData - Datos de cribado PRISMA
     * @param {Array<number>} screeScores - Lista de puntajes de cribado
     * @param {Array<Object>} searchStrategy - Datos de estrategia de búsqueda (Source, Hits, Query)
     * @param {Object} enhancedChartData - Datos para 4 nuevos gráficos académicos (distribución temporal, calidad, bubble, síntesis)
     * @returns {Promise<Object>} Rutas de las imágenes generadas
     */
    async generateCharts(prismaData, screeScores, searchStrategy, enhancedChartData = null) {
        return new Promise((resolve, reject) => {
            // Build databases list: prioritize referencesBySource (real imported refs), fallback to searchStrategy
            let databases = [];
            
            console.log('🔍 DEBUG - prismaData.referencesBySource:', prismaData.referencesBySource);
            console.log('🔍 DEBUG - searchStrategy:', searchStrategy);
            
            if (prismaData.referencesBySource && Object.keys(prismaData.referencesBySource).length > 0) {
                // Use REAL imported references (filtrar Unknown)
                databases = Object.entries(prismaData.referencesBySource)
                    .filter(([name]) => name !== 'Unknown')
                    .map(([name, hits]) => ({
                    name,
                    hits
                }));
                console.log('✅ Using REAL imported references by source:', databases);
            } else if (searchStrategy && searchStrategy.length > 0) {
                // Fallback to search strategy — only include databases with hits > 0
                databases = searchStrategy
                    .filter(sq => (sq.hits || 0) > 0)
                    .map(sq => ({
                    name: sq.name || 'Unknown',
                    hits: sq.hits || 0
                }));
                console.log('⚠️ Using search strategy (fallback):', databases);
            } else {
                console.error('❌ NO databases data available!');
            }

            // Usar los campos correctos del contexto PRISMA
            const totalIdentified = prismaData.identified || 0;
            const duplicates = prismaData.duplicatesRemoved || 0;
            const screened = prismaData.screenedTitleAbstract || (totalIdentified - duplicates);
            const excludedTA = prismaData.excludedTitleAbstract || 0;
            const fullTextAssessed = prismaData.fullTextAssessed || 0;
            const excludedFullText = prismaData.excludedFullText || 0;
            const finalIncluded = prismaData.includedFinal || 0;
            
            // Calcular retrieved como los que fueron seleccionados para evaluación
            const fullTextRetrieved = fullTextAssessed;

            const inputData = {
                prisma: {
                    identified: totalIdentified,
                    databases: databases,
                    duplicates: duplicates,
                    screened: screened,
                    excluded: excludedTA,
                    retrieved: fullTextRetrieved,
                    not_retrieved: 0,
                    assessed: fullTextAssessed,
                    excluded_fulltext: excludedFullText,
                    excluded_reasons: prismaData.exclusionReasons || {},
                    included: finalIncluded
                },
                scree: {
                    scores: screeScores || []
                },
                search_strategy: searchStrategy || []
            };

            // Agregar datos de los 4 nuevos gráficos académicos si están disponibles
            if (enhancedChartData) {
                inputData.temporal_distribution = enhancedChartData.temporal_distribution;
                inputData.quality_assessment = enhancedChartData.quality_assessment;
                inputData.bubble_chart = enhancedChartData.bubble_chart;
                inputData.technical_synthesis = enhancedChartData.technical_synthesis;
            }

            console.log('📊 Datos enviados a Python:');
            console.log('   - PRISMA stats:', prismaData);
            console.log('   - Databases/Sources:', databases);
            console.log('   - Scores disponibles:', screeScores?.length || 0);
            console.log('   - Primer score (ejemplo):', screeScores?.[0]);
            console.log('   - Search strategy queries:', searchStrategy?.length || 0);
            console.log('   - Enhanced charts:', enhancedChartData ? 'YES' : 'NO');
            console.log('📊 Generando gráficos con Python...');

            // Usar python3 para compatibilidad con entornos Linux/Render
            const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
            const pythonProcess = spawn(pythonCommand, [this.scriptPath, '--output-dir', this.outputDir]);

            let stdout = '';
            let stderr = '';

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            pythonProcess.on('close', (code) => {
                // SIEMPRE mostrar stderr para debug (incluso si exitoso)
                if (stderr.trim()) {
                    console.log('🐍 Python stderr output:', stderr);
                }
                
                if (code !== 0) {
                    console.error('❌ Error generando gráficos (código de salida:', code, ')');
                    console.error('❌ STDERR:', stderr);
                    console.error('❌ STDOUT:', stdout);
                    // No fallar drásticamente, retornar vacío para no romper generación de artículo
                    resolve({});
                    return;
                }

                console.log('🐍 Python output (raw):', stdout);
                
                try {
                    const results = JSON.parse(stdout);
                    console.log('📊 Resultados parseados:', results);
                    
                    // Convertir a URLs absolutas apuntando al backend
                    const backendUrl = process.env.BACKEND_URL || 'https://tesis-rsl-backend.onrender.com';
                    
                    // Cache-busting: agregar timestamp para evitar que el navegador use versiones antiguas
                    const timestamp = Date.now();
                    
                    const urls = {};
                    // Gráficos originales
                    if (results.prisma) urls.prisma = `${backendUrl}/uploads/charts/${results.prisma}?t=${timestamp}`;
                    if (results.scree) urls.scree = `${backendUrl}/uploads/charts/${results.scree}?t=${timestamp}`;
                    if (results.chart1) urls.chart1 = `${backendUrl}/uploads/charts/${results.chart1}?t=${timestamp}`;
                    
                    // 4 Nuevos gráficos académicos
                    if (results.temporal_distribution) {
                        urls.temporal_distribution = `${backendUrl}/uploads/charts/${results.temporal_distribution}?t=${timestamp}`;
                    }
                    if (results.quality_assessment) {
                        urls.quality_assessment = `${backendUrl}/uploads/charts/${results.quality_assessment}?t=${timestamp}`;
                    }
                    if (results.bubble_chart) {
                        urls.bubble_chart = `${backendUrl}/uploads/charts/${results.bubble_chart}?t=${timestamp}`;
                    }
                    if (results.technical_synthesis) {
                        urls.technical_synthesis = `${backendUrl}/uploads/charts/${results.technical_synthesis}?t=${timestamp}`;
                    }

                    console.log('✅ URLs finales de gráficos (con cache-busting):', urls);
                    resolve(urls);
                } catch (e) {
                    console.error('❌ Error parseando output de Python:', e);
                    console.error('   Output recibido:', stdout);
                    resolve({});
                }
            });

            pythonProcess.stdin.write(JSON.stringify(inputData));
            pythonProcess.stdin.end();
        });
    }
}

module.exports = PythonGraphService;
