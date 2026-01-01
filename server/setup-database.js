import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  multipleStatements: true
};

console.log('Setting up MySQL database...');
console.log(`Host: ${dbConfig.host}`);
console.log(`Port: ${dbConfig.port}`);
console.log(`User: ${dbConfig.user}`);

try {
  // Connect without specifying database
  const connection = await mysql.createConnection(dbConfig);
  console.log('✅ Connected to MySQL server');
  
  // Read and execute schema.sql
  const schemaPath = join(__dirname, 'database', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf8');
  
  console.log('📝 Executing schema.sql...');
  await connection.query(schema);
  console.log('✅ Database schema created successfully!');
  
  // Verify tables were created
  await connection.query('USE medreminder');
  const [tables] = await connection.query('SHOW TABLES');
  console.log(`✅ Created ${tables.length} tables:`);
  tables.forEach(table => {
    console.log(`   - ${Object.values(table)[0]}`);
  });
  
  await connection.end();
  console.log('\n🎉 Database setup complete! You can now run the tests.');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.log('\n📝 To fix:');
    console.log('   1. Update DB_PASSWORD in server/.env with your MySQL root password');
    console.log('   2. Or create a new MySQL user for this application');
  }
  
  process.exit(1);
}
