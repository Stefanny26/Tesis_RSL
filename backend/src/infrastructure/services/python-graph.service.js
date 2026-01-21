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
     * @returns {Promise<Object>} Rutas de las imágenes generadas
     */
    async generateCharts(prismaData, screeScores, searchStrategy) {
        return new Promise((resolve, reject) => {
            const inputData = {
                prisma: {
                    identified: prismaData.identified || 0,
                    duplicates: prismaData.duplicatesRemoved || 0,
                    screened: prismaData.screenedTitleAbstract || 0,
                    excluded: prismaData.excludedTitleAbstract || 0,
                    retrieved: prismaData.fullTextRetrieved || ((prismaData.screenedTitleAbstract || 0) - (prismaData.excludedTitleAbstract || 0)),
                    not_retrieved: 0, // Ajustar si tienes datos reales
                    assessed: prismaData.fullTextAssessed || 0,
                    excluded_reasons: prismaData.exclusionReasons || {}, // Necesitas agregar esto al PRISMA context si no está
                    included: prismaData.includedFinal || 0
                },
                scree: {
                    scores: screeScores || []
                },
                search_strategy: searchStrategy || []
            };

            console.log('📊 Datos enviados a Python:');
            console.log('   - PRISMA stats:', prismaData);
            console.log('   - Scores disponibles:', screeScores?.length || 0);
            console.log('   - Primer score (ejemplo):', screeScores?.[0]);
            console.log('   - Search strategy queries:', searchStrategy?.length || 0);
            console.log('📊 Generando gráficos con Python...');

            const pythonProcess = spawn('python', [this.scriptPath, '--output-dir', this.outputDir]);

            let stdout = '';
            let stderr = '';

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            pythonProcess.on('close', (code) => {
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
                    
                    // En producción (Render), usar base64 porque el sistema de archivos es efímero
                    // En desarrollo, usar URLs locales
                    const isProduction = process.env.NODE_ENV === 'production';
                    
                    const urls = {};
                    
                    if (isProduction) {
                        // Usar base64 directamente en producción
                        console.log('🔧 Modo producción: usando imágenes base64');
                        if (results.prisma_base64) urls.prisma = results.prisma_base64;
                        if (results.scree_base64) urls.scree = results.scree_base64;
                        if (results.chart1_base64) urls.chart1 = results.chart1_base64;
                    } else {
                        // Usar URLs en desarrollo local
                        console.log('🔧 Modo desarrollo: usando URLs locales');
                        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
                        if (results.prisma) urls.prisma = `${backendUrl}/uploads/charts/${results.prisma}`;
                        if (results.scree) urls.scree = `${backendUrl}/uploads/charts/${results.scree}`;
                        if (results.chart1) urls.chart1 = `${backendUrl}/uploads/charts/${results.chart1}`;
                    }

                    console.log('✅ URLs finales de gráficos:', 
                        isProduction ? 
                        { prisma: '✅ base64', scree: '✅ base64', chart1: '✅ base64' } : 
                        urls
                    );
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
