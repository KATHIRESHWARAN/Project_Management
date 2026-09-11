const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 1. Load .env based on actual location of the script
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error(`[Config Error] .env file not found at: ${envPath}`);
  process.exit(1);
}
dotenv.config({ path: envPath });

// 2. Validate and load the single Aiven CA certificate
const CA_CERT_PATH = path.join(__dirname, 'certs', 'ca.pem');
if (!fs.existsSync(CA_CERT_PATH)) {
  console.error(`[SSL Error] Aiven CA certificate not found at: ${CA_CERT_PATH}`);
  console.error('The Aiven CA certificate is required for secure connection verification. Insecure connection is not permitted.');
  process.exit(1);
}

let caCert;
try {
  caCert = fs.readFileSync(CA_CERT_PATH);
} catch (err) {
  console.error(`[SSL Error] Failed to read Aiven CA certificate at ${CA_CERT_PATH}: ${err.message}`);
  process.exit(1);
}

async function initCloudDb() {
  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'defaultdb';

  console.log(`Connecting to Aiven MySQL at ${host}:${port} (Database: ${database}, User: ${user})...`);

  const connectionConfig = {
    host,
    port,
    user,
    password,
    database,
    ssl: {
      ca: caCert,
      rejectUnauthorized: true,
    },
    multipleStatements: true,
  };

  let conn;
  try {
    conn = await mysql.createConnection(connectionConfig);
    console.log(' Connected to Aiven MySQL successfully with SSL verification (rejectUnauthorized: true)!');

    // Read and apply schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Strip CREATE DATABASE and USE statements so it executes inside existing Aiven database
    const cleanSchema = schemaSql
      .replace(/CREATE DATABASE[\s\S]*?;/gi, '')
      .replace(/USE\s+[\w_]+;/gi, '');

    console.log(' Applying schema definitions (CREATE TABLE IF NOT EXISTS)...');
    await conn.query(cleanSchema);
    console.log(' Schema applied safely.');

    // Seed data: ONLY run when --seed is explicitly passed
    if (process.argv.includes('--seed')) {
      const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      const cleanSeed = seedSql.replace(/USE\s+[\w_]+;/gi, '');
      console.log(' Importing demo seed data (--seed specified)...');
      await conn.query(cleanSeed);
      console.log(' Seed data imported successfully!');
    } else {
      console.log(' Skipping seed data (--seed not specified; existing data preserved).');
    }

    // Post-connection Verification
    console.log('\n--- Database Verification ---');

    const [userRows] = await conn.query('SELECT COUNT(*) as count FROM users');
    const [projectRows] = await conn.query('SELECT COUNT(*) as count FROM projects');
    const [taskRows] = await conn.query('SELECT COUNT(*) as count FROM tasks');

    console.log(` Table 'users': EXISTS | ${userRows[0].count} records`);
    console.log(` Table 'projects': EXISTS | ${projectRows[0].count} records`);
    console.log(` Table 'tasks': EXISTS | ${taskRows[0].count} records`);

    // Verify foreign key relationships and ON DELETE CASCADE
    const [foreignKeys] = await conn.query(`
      SELECT 
        kcu.TABLE_NAME, 
        kcu.COLUMN_NAME, 
        kcu.CONSTRAINT_NAME, 
        kcu.REFERENCED_TABLE_NAME, 
        kcu.REFERENCED_COLUMN_NAME,
        rc.DELETE_RULE
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
        ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
        AND kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
      WHERE kcu.TABLE_SCHEMA = ? AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY kcu.TABLE_NAME, kcu.CONSTRAINT_NAME
    `, [database]);

    console.log('\n Foreign Key Constraints:');
    for (const fk of foreignKeys) {
      console.log(`   ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} [Constraint: ${fk.CONSTRAINT_NAME}, ON DELETE: ${fk.DELETE_RULE}]`);
    }

    console.log('\n Aiven Cloud MySQL database is verified and ready for use!');

  } catch (err) {
    console.error(' Database connection or execution failed:');
    console.error(`  Error: ${err.message}`);
    if (err.code) console.error(`  Code: ${err.code}`);
    process.exitCode = 1;
  } finally {
    if (conn) {
      await conn.end();
      console.log(' MySQL connection closed cleanly.');
    }
  }
}

if (require.main === module) {
  initCloudDb();
}

module.exports = { initCloudDb };
