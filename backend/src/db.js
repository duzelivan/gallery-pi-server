const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'gallery',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDb() {
  let retries = 15;
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ MySQL konekcija uspješna');
      connection.release();
      
      // Kreiraj tablice
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin', 'user') DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          title VARCHAR(255),
          description TEXT,
          category VARCHAR(100),
          date_taken DATE,
          file_path VARCHAR(500) NOT NULL,
          thumbnail_path VARCHAR(500),
          file_size INT,
          width INT,
          height INT,
          uploaded_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES users(id)
        )
      `);

      const [admins] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
      if (admins.length === 0) {
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash('admin123', 10);
        await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hash, 'admin']);
        console.log('✅ Admin kreiran: admin / admin123');
      }
      
      console.log('✅ Baza inicijalizirana');
      return;
    } catch (err) {
      console.log(`⏳ Čekam MySQL... (${retries} preostalo) - ${err.message}`);
      retries--;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.error('❌ MySQL nedostupan nakon 15 pokušaja');
}

initDb();
    const [admins] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (admins.length === 0) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('admin123', 10);
      await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hash, 'admin']);
      console.log('✅ Admin kreiran: admin / admin123');
    }

    console.log('✅ Baza inicijalizirana');
  } catch (err) {
    console.error('❌ Greška baze:', err.message);
  }
}

initDb();

module.exports = pool;
