const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/images', require('./routes/images'));
app.use('/api/users', require('./routes/users'));

app.get('/api/health', async (req, res) => {
  res.json({ status: 'OK', server: 'Gallery Pi Server', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Gallery API', 
    endpoints: ['/api/images', '/api/users', '/api/health']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🖼️ Gallery server na portu ${PORT}`);
});