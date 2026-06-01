const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: err.message });
  }
});

// API routes
app.use('/api/images', require('./routes/images'));
app.use('/api/users', require('./routes/users'));

// Root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Gallery API', 
    endpoints: ['/api/images', '/api/users', '/api/health']
  });
});

// Čekaj bazu prije pokretanja servera
async function startServer() {
  let retries = 20;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ MySQL spreman, pokrećem server...');
      break;
    } catch (err) {
      console.log(`⏳ Čekam MySQL... (${retries} preostalo)`);
      retries--;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🖼️ Gallery server na portu ${PORT}`);
  });
}

startServer();
