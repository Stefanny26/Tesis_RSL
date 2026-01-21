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
                    
                    // Convertir a URLs absolutas apuntando al backend
                    const backendUrl = process.env.BACKEND_URL;
                    
                    if (!backendUrl) {
                        console.error('❌ ERROR CRÍTICO: BACKEND_URL no está configurada en las variables de entorno');
                        console.error('   Configura BACKEND_URL en Render Dashboard para que las imágenes funcionen');
                    }
                    
                    const baseUrl = backendUrl || process.env.FRONTEND_URL?.replace('3000', '3001') || 'http://localhost:3001';
                    const urls = {};
                    if (results.prisma) urls.prisma = `${baseUrl}/uploads/charts/${results.prisma}`;
                    if (results.scree) urls.scree = `${baseUrl}/uploads/charts/${results.scree}`;
                    if (results.chart1) urls.chart1 = `${baseUrl}/uploads/charts/${results.chart1}`;

                    console.log('✅ URLs finales de gráficos:', urls);
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
