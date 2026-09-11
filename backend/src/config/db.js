const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

// SSL configuration using the Aiven CA certificate
const getSSLConfig = () => {
  if (process.env.DB_SSL !== 'true') {
    return undefined;
  }

  // 1. Raw CA certificate provided directly via environment variable (useful on Render)
  if (process.env.DB_SSL_CA_CERT) {
    return {
      ca: process.env.DB_SSL_CA_CERT,
      rejectUnauthorized: true,
    };
  }

  // 2. CA certificate file path (from DB_SSL_CA env or default to backend/certs/ca.pem)
  const caCertPath = process.env.DB_SSL_CA
    ? (path.isAbsolute(process.env.DB_SSL_CA)
        ? process.env.DB_SSL_CA
        : path.resolve(process.cwd(), process.env.DB_SSL_CA))
    : path.join(__dirname, '../../certs/ca.pem');

  if (fs.existsSync(caCertPath)) {
    return {
      ca: fs.readFileSync(caCertPath),
      rejectUnauthorized: true,
    };
  }

  // Fallback check relative to backend directory
  const fallbackPath = path.join(__dirname, '../../certs/ca.pem');
  if (fs.existsSync(fallbackPath)) {
    return {
      ca: fs.readFileSync(fallbackPath),
      rejectUnauthorized: true,
    };
  }

  throw new Error(`[Database SSL Error] Aiven CA certificate not found at: ${caCertPath}`);
};

// Create connection pool to MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'project_management',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // Keep DATE types formatted as YYYY-MM-DD
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: getSSLConfig(),
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database: ${process.env.DB_NAME || 'project_management'}`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MySQL:`, error.message);
    console.warn(`[Database Hint] Ensure MySQL service is running and DB_PASSWORD in backend/.env matches your local MySQL root password.`);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
};
