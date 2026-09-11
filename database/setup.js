const fs = require('fs');
const path = require('path');
const mysql = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mysql2', 'promise'));
const dotenv = require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv'));

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const port = parseInt(process.env.DB_PORT, 10) || 3306;

async function runSQLScript(connection, filePath) {
  console.log(`[Setup] Executing SQL script: ${path.basename(filePath)}...`);
  const sql = fs.readFileSync(filePath, 'utf8');

  // Split SQL commands by semicolon (ignoring comments)
  const statements = sql
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    if (statement.length > 0) {
      await connection.query(statement);
    }
  }
  console.log(`[Setup] Successfully executed: ${path.basename(filePath)}`);
}

async function main() {
  console.log('==================================================');
  console.log('📦 Project Management Database Setup');
  console.log(`Host: ${host}:${port} | User: ${user}`);
  console.log('==================================================');

  let connection;
  try {
    // Connect to MySQL server (without specifying database initially)
    connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      multipleStatements: true,
    });
    console.log('✅ Connected to MySQL server successfully.');

    // Execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    await runSQLScript(connection, schemaPath);

    // Execute seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    await runSQLScript(connection, seedPath);

    console.log('==================================================');
    console.log('🎉 Database and tables configured and seeded successfully!');
    console.log('==================================================');
  } catch (error) {
    console.error('❌ Database setup encountered an error:');
    console.error(error.message);
    console.log('\nTip: Please update DB_PASSWORD in backend/.env with your MySQL root password and run again:');
    console.log('  node database/setup.js');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
