/**
 * Migration: Update existing references to add source field based on importedFrom filename
 * 
 * This script detects the database source from the filename of imported references
 * and updates the source field accordingly.
 * 
 * Usage: node migrations/update-references-source.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Detecta la base de datos de origen desde el nombre del archivo
 */
function detectDatabaseSource(filename) {
  if (!filename) return null;
  
  const lowerFilename = filename.toLowerCase();
  
  // Detección por nombre de archivo
  if (lowerFilename.includes('ieee')) return 'IEEE Xplore';
  if (lowerFilename.includes('scopus')) return 'Scopus';
  if (lowerFilename.includes('acm')) return 'ACM Digital Library';
  if (lowerFilename.includes('pubmed') || lowerFilename.includes('.nbib')) return 'PubMed';
  if (lowerFilename.includes('wos') || lowerFilename.includes('webofscience') || lowerFilename.endsWith('.ciw')) return 'Web of Science';
  if (lowerFilename.includes('springer')) return 'Springer';
  if (lowerFilename.includes('sciencedirect') || lowerFilename.includes('elsevier')) return 'ScienceDirect';
  if (lowerFilename.includes('arxiv')) return 'arXiv';
  
  return null;
}

async function migrateReferenceSources() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration: Update references source field...\n');
    
    // 1. Get all references without source
    const result = await client.query(`
      SELECT id, doi, title 
      FROM "references" 
      WHERE source IS NULL
    `);
    
    console.log(`📊 Found ${result.rows.length} references without source field\n`);
    
    if (result.rows.length === 0) {
      console.log('✅ No references to update. All references already have source!\n');
      return;
    }
    
    // 2. Update each reference
    let updated = 0;
    let failed = 0;
    let unknownCount = 0;
    const sourceCounts = {};
    
    for (const row of result.rows) {
      // Try to detect from DOI or title
      let detectedSource = null;
      
      if (row.doi) {
        const doi = row.doi.toLowerCase();
        if (doi.includes('10.1109')) detectedSource = 'IEEE Xplore';
        else if (doi.includes('10.1145')) detectedSource = 'ACM Digital Library';
        else if (doi.includes('10.1007')) detectedSource = 'Springer';
        else if (doi.includes('10.1016')) detectedSource = 'ScienceDirect';
      }
      
      // If can't detect, mark as Unknown
      if (!detectedSource) {
        detectedSource = 'Unknown';
        unknownCount++;
      }
      
      try {
        await client.query(
          'UPDATE "references" SET source = $1 WHERE id = $2',
          [detectedSource, row.id]
        );
        
        sourceCounts[detectedSource] = (sourceCounts[detectedSource] || 0) + 1;
        updated++;
        
        if (updated % 10 === 0) {
          process.stdout.write(`\r   Updated: ${updated}/${result.rows.length}`);
        }
      } catch (err) {
        console.error(`\n❌ Error updating reference ${row.id}:`, err.message);
        failed++;
      }
    }
    
    console.log(`\n\n✅ Migration completed!`);
    console.log(`   ✔ Updated: ${updated}`);
    console.log(`   ✖ Failed: ${failed}`);
    console.log(`   ⚠ Set to 'Unknown': ${unknownCount}\n`);
    
    if (Object.keys(sourceCounts).length > 0) {
      console.log('📊 Updated references by source:');
      for (const [source, count] of Object.entries(sourceCounts)) {
        console.log(`   - ${source}: ${count}`);
      }
      console.log('');
    }
    
    // 3. Show summary of all sources
    const summaryResult = await client.query(`
      SELECT source, COUNT(*) as count
      FROM "references"
      WHERE source IS NOT NULL
      GROUP BY source
      ORDER BY count DESC
    `);
    
    console.log('📊 Current database sources in all projects:');
    for (const row of summaryResult.rows) {
      console.log(`   - ${row.source}: ${row.count}`);
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateReferenceSources()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
