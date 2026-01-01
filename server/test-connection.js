import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'medreminder'
};

console.log('Testing MySQL connection with config:');
console.log(`Host: ${dbConfig.host}`);
console.log(`Port: ${dbConfig.port}`);
console.log(`User: ${dbConfig.user}`);
console.log(`Database: ${dbConfig.database}`);
console.log(`Password: ${dbConfig.password ? '***' : '(not set)'}`);

try {
  const connection = await mysql.createConnection(dbConfig);
  console.log('✅ Connection successful!');
  
  // Test if database exists
  const [rows] = await connection.query('SELECT DATABASE()');
  console.log('✅ Connected to database:', rows[0]['DATABASE()']);
  
  // Test if tables exist
  const [tables] = await connection.query('SHOW TABLES');
  console.log('✅ Tables found:', tables.length);
  if (tables.length > 0) {
    console.log('   Tables:', tables.map(t => Object.values(t)[0]).join(', '));
  } else {
    console.log('⚠️  No tables found. Please run schema.sql in MySQL Workbench.');
  }
  
  await connection.end();
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  console.error('Error code:', error.code);
  
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.log('\n📝 To fix:');
    console.log('   1. Update DB_PASSWORD in server/.env with your MySQL root password');
    console.log('   2. Or create a new MySQL user for this application');
  } else if (error.code === 'ER_BAD_DB_ERROR') {
    console.log('\n📝 To fix:');
    console.log('   1. Open MySQL Workbench');
    console.log('   2. Execute server/database/schema.sql to create the database');
  }
  
  process.exit(1);
}
