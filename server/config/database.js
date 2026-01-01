import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  constructor() {
    this.pool = null;
    this.maxRetries = parseInt(process.env.DB_MAX_RETRIES) || 5;
    this.initialRetryDelay = parseInt(process.env.DB_INITIAL_RETRY_DELAY) || 1000; // 1 second
  }

  /**
   * Connect to MySQL database with retry logic and exponential backoff
   * @param {number} retryCount - Current retry attempt (used internally)
   * @returns {Promise<void>}
   */
  async connect(retryCount = 0) {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'medreminder',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // Test the connection
      const connection = await this.pool.getConnection();
      console.log('✅ MySQL database connected successfully');
      connection.release();
    } catch (error) {
      console.error(`❌ MySQL connection error (attempt ${retryCount + 1}/${this.maxRetries}):`, error.message);
      
      // If we haven't exceeded max retries, retry with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = this.initialRetryDelay * Math.pow(2, retryCount);
        console.log(`⏳ Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connect(retryCount + 1);
      }
      
      // Max retries exceeded
      throw error;
    }
  }

  async query(sql, params = []) {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('MySQL connection pool closed');
    }
  }
}

// Export singleton instance
const database = new Database();
export default database;
