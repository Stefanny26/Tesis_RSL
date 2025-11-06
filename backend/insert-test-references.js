const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'Tesis_RSL',
  user: 'postgres',
  password: 'root'
});

// Referencias de prueba sobre MFA (Multifactor Authentication) en aplicaciones web
const testReferences = [
  {
    title: 'Multifactor Authentication (MFA) in Web Applications: A Systematic Literature Review on Security, Usability, and Performance Outcomes',
    authors: 'Smith, J., Johnson, M., Williams, K.',
    year: 2023,
    journal: 'IEEE Xplore',
    abstract: 'This systematic review examines the impact of multifactor authentication implementation on security, usability and performance in modern web applications compared to traditional password-based authentication methods.',
    source: 'IEEE Xplore',
    doi: '10.1109/ACCESS.2023.1234567'
  },
  {
    title: 'User Experience Challenges in Implementing Biometric MFA for Enterprise Web Systems',
    authors: 'García, A., López, R., Martínez, C.',
    year: 2022,
    journal: 'ACM Digital Library',
    abstract: 'This paper analyzes the usability challenges faced by enterprise users when adopting biometric-based multifactor authentication systems in web-based corporate applications.',
    source: 'ACM Digital Library',
    doi: '10.1145/3565432.3565433'
  },
  {
    title: 'Performance Impact of SMS-Based Two-Factor Authentication on Mobile Web Applications',
    authors: 'Brown, T., Davis, P., Wilson, S.',
    year: 2022,
    journal: 'SpringerLink',
    abstract: 'An empirical study measuring latency and performance degradation caused by SMS-based 2FA implementation across different mobile web platforms.',
    source: 'SpringerLink',
    doi: '10.1007/s10207-022-00123-4'
  },
  {
    title: 'Comparative Analysis of FIDO2 and TOTP for Web Application Security',
    authors: 'Chen, L., Wang, X., Liu, Y.',
    year: 2024,
    journal: 'Scopus',
    abstract: 'This study compares FIDO2 WebAuthn protocol against Time-based One-Time Passwords (TOTP) in terms of security strength, user adoption rates, and implementation complexity in web environments.',
    source: 'Scopus',
    doi: '10.1016/j.cose.2024.103456'
  },
  {
    title: 'Adoption Barriers of Multifactor Authentication in Small and Medium Enterprises',
    authors: 'Anderson, K., Taylor, M., Roberts, E.',
    year: 2023,
    journal: 'Web of Science',
    abstract: 'Investigates the organizational, technical, and economic barriers preventing SMEs from implementing MFA solutions in their web-based business applications.',
    source: 'Web of Science',
    doi: '10.1080/19439342.2023.2234567'
  },
  {
    title: 'Security vs Convenience: User Preferences in Web-Based MFA Methods',
    authors: 'Miller, S., Davis, J., Thompson, L.',
    year: 2023,
    journal: 'Google Scholar',
    abstract: 'Survey-based research exploring end-user preferences between various MFA methods including push notifications, hardware tokens, and biometrics for web applications.',
    source: 'Google Scholar',
    doi: '10.3389/fcomp.2023.1098765'
  },
  {
    title: 'Machine Learning Approaches for Detecting MFA Bypass Attacks in Web Systems',
    authors: 'Rodriguez, M., Silva, P., Costa, R.',
    year: 2024,
    journal: 'IEEE Xplore',
    abstract: 'Proposes novel machine learning algorithms to detect and prevent social engineering and technical attacks attempting to bypass multifactor authentication in web platforms.',
    source: 'IEEE Xplore',
    doi: '10.1109/TIFS.2024.3456789'
  },
  {
    title: 'Passwordless Authentication: The Future of Web Application Security',
    authors: 'Kim, H., Park, S., Lee, J.',
    year: 2024,
    journal: 'ScienceDirect',
    abstract: 'Examines the transition from traditional MFA to completely passwordless authentication systems using FIDO2 standards in modern web applications.',
    source: 'ScienceDirect',
    doi: '10.1016/j.jisa.2024.103234'
  },
  {
    title: 'Legacy System Integration with Modern MFA Solutions: Challenges and Solutions',
    authors: 'White, D., Green, A., Black, M.',
    year: 2022,
    journal: 'SpringerLink',
    abstract: 'Discusses technical challenges and architectural patterns for integrating MFA capabilities into legacy web applications without complete system redesign.',
    source: 'SpringerLink',
    doi: '10.1007/978-3-031-12345-6_15'
  },
  {
    title: 'Cost-Benefit Analysis of Implementing Enterprise MFA Across Web Infrastructure',
    authors: 'Johnson, R., Williams, T., Brown, K.',
    year: 2023,
    journal: 'ACM Digital Library',
    abstract: 'Quantitative analysis of the total cost of ownership versus security benefits gained from implementing enterprise-wide MFA across web-based systems.',
    source: 'ACM Digital Library',
    doi: '10.1145/3576915.3576920'
  },
  {
    title: 'Mobile App vs Web Browser: MFA User Experience Comparison',
    authors: 'Zhang, Y., Liu, Q., Wang, H.',
    year: 2023,
    journal: 'Scopus',
    abstract: 'Comparative usability study measuring user satisfaction and task completion time for MFA authentication through native mobile apps versus mobile web browsers.',
    source: 'Scopus',
    doi: '10.1016/j.chb.2023.107890'
  },
  {
    title: 'The Role of Risk-Based Authentication in Adaptive MFA Systems',
    authors: 'Martinez, C., Lopez, F., Sanchez, A.',
    year: 2024,
    journal: 'IEEE Xplore',
    abstract: 'Explores adaptive authentication systems that dynamically adjust MFA requirements based on real-time risk assessment in web applications.',
    source: 'IEEE Xplore',
    doi: '10.1109/TDSC.2024.3398765'
  }
];

async function insertTestReferences() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Insertando referencias de prueba...\n');
    
    // Obtener el primer proyecto del usuario
    const projectQuery = 'SELECT id, title FROM projects ORDER BY created_at DESC LIMIT 1';
    const projectResult = await client.query(projectQuery);
    
    if (projectResult.rows.length === 0) {
      console.log('❌ No hay proyectos en la base de datos. Por favor crea un proyecto primero.');
      return;
    }
    
    const project = projectResult.rows[0];
    console.log(`📁 Insertando referencias en proyecto: "${project.title}"`);
    console.log(`   ID: ${project.id}\n`);
    
    let insertedCount = 0;
    
    for (const ref of testReferences) {
      const query = `
        INSERT INTO "references" (
          project_id, title, authors, year, journal, abstract, 
          source, doi, screening_status, imported_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id, title
      `;
      
      const values = [
        project.id,
        ref.title,
        ref.authors,
        ref.year,
        ref.journal,
        ref.abstract,
        ref.source,
        ref.doi,
        'pending'
      ];
      
      const result = await client.query(query, values);
      insertedCount++;
      console.log(`✅ [${insertedCount}/${testReferences.length}] ${result.rows[0].title.substring(0, 60)}...`);
    }
    
    console.log(`\n🎉 ${insertedCount} referencias insertadas exitosamente!`);
    
    // Mostrar estadísticas
    const statsQuery = `
      SELECT 
        screening_status,
        COUNT(*) as count
      FROM "references"
      WHERE project_id = $1
      GROUP BY screening_status
    `;
    const statsResult = await client.query(statsQuery, [project.id]);
    
    console.log('\n📊 Estadísticas del proyecto:');
    statsResult.rows.forEach(row => {
      console.log(`   ${row.screening_status}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error insertando referencias:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

insertTestReferences();
