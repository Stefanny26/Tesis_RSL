const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const data = {
    prisma: {
        identified: 181,
        duplicates: 20,
        screened: 161,
        excluded: 130,
        retrieved: 31,
        not_retrieved: 0,
        assessed: 31,
        excluded_reasons: { 'Not relevant': 25, 'Wrong language': 3 },
        included: 3
    },
    scree: {
        scores: [0.95, 0.9, 0.85, 0.8, 0.75, 0.5, 0.45, 0.4, 0.35, 0.3, 0.2, 0.1]
    },
    search_strategy: [
        { name: "Scopus", hits: 7, searchString: '( ABS ( "Mongoose" ) OR ABS ( "Mongoose ODM" ) ) AND ( ABS ( "MongoDB" ) OR ABS ( "NoSQL" ) )' },
        { name: "IEEE Xplore", hits: 133, searchString: '("Abstract":Mongoose) OR ("Abstract":Mongoose Object Document Mapper)' },
        { name: "ACM Digital Library", hits: 5, searchString: '("Mongoose" OR "Mongoose ODM") AND ("MongoDB" OR "NoSQL")' }
    ]
};

const scriptPath = path.join(__dirname, 'generate_charts.py');
const outputDir = path.join(__dirname, '../uploads/charts');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Spawning python script...');
const pythonProcess = spawn('python', [scriptPath, '--output-dir', outputDir]);

let stdout = '';
let stderr = '';

pythonProcess.stdout.on('data', (data) => {
    stdout += data.toString();
});

pythonProcess.stderr.on('data', (data) => {
    stderr += data.toString();
});

pythonProcess.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
    console.log('STDOUT:', stdout);
    console.error('STDERR:', stderr);
});

pythonProcess.stdin.write(JSON.stringify(data));
pythonProcess.stdin.end();
