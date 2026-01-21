require('dotenv').config();
const db = require('../src/config/database');

async function verify() {
    try {
        await db.connect();
        console.log('Testing access to total_score col...');
        // We might not have any records, but the query parsing should succeed or fail immediately if column is invalid
        const result = await db.query(`
            SELECT total_score 
            FROM screening_records 
            LIMIT 1
        `);
        console.log('Query successful!');
        console.log('Data:', result.rows);
    } catch (error) {
        console.error('Query FAILED:', error.message);
        if (error.code) console.error('Error Code:', error.code);
    } finally {
        process.exit();
    }
}

verify();
