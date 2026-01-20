require('dotenv').config();
const db = require('../src/config/database');

async function inspect() {
    try {
        await db.connect();
        console.log('Querying users table...');
        const result = await db.query('SELECT * FROM users LIMIT 1');
        if (result.rows.length > 0) {
            console.log('Columns found:', Object.keys(result.rows[0]));
        } else {
            console.log('Table exists but is empty. Trying to get column names from information_schema...');
            const schema = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
            console.log('Schema columns:', schema.rows.map(r => r.column_name));
        }
    } catch (error) {
        console.error('Error inspecting DB:', error);
    } finally {
        process.exit();
    }
}

inspect();
