const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const USB_PATH = process.env.USB_PATH || '/mnt/usb/gallery';
const THUMB_PATH = path.join(USB_PATH, 'thumbnails');

[USB_PATH, THUMB_PATH].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, USB_PATH),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Samo slike su dozvoljene'));
  }
});

router.post('/upload', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nema slike' });

    const { title, description, category, date_taken } = req.body;
    const filename = req.file.filename;
    const filePath = req.file.path;

    const thumbName = `thumb_${filename}`;
    const thumbPath = path.join(THUMB_PATH, thumbName);

    await sharp(filePath)
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);

    const metadata = await sharp(filePath).metadata();

    const [result] = await pool.query(
      `INSERT INTO images (filename, original_name, title, description, category, date_taken, 
       file_path, thumbnail_path, file_size, width, height, uploaded_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [filename, req.file.originalname, title, description, category, date_taken,
       filePath, thumbPath, req.file.size, metadata.width, metadata.height, req.user.id]
    );

    res.json({ 
      id: result.insertId, 
      filename, 
      thumbnail: `/images/thumbnails/${thumbName}`,
      message: 'Slika uploadana' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/timeline', async (req, res) => {
  try {
    const { category, year, month } = req.query;
    let sql = 'SELECT * FROM images WHERE 1=1';
    const params = [];

    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (year) { sql += ' AND YEAR(date_taken) = ?'; params.push(year); }
    if (month) { sql += ' AND MONTH(date_taken) = ?'; params.push(month); }

    sql += ' ORDER BY date_taken DESC, created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ images: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM images WHERE category IS NOT NULL');
    res.json({ categories: rows.map(r => r.category) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/years', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT YEAR(date_taken) as year FROM images WHERE date_taken IS NOT NULL ORDER BY year DESC');
    res.json({ years: rows.map(r => r.year) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const [images] = await pool.query('SELECT * FROM images WHERE id = ?', [req.params.id]);
    if (images.length === 0) return res.status(404).json({ error: 'Slika ne postoji' });

    const img = images[0];
    if (fs.existsSync(img.file_path)) fs.unlinkSync(img.file_path);
    if (fs.existsSync(img.thumbnail_path)) fs.unlinkSync(img.thumbnail_path);

    await pool.query('DELETE FROM images WHERE id = ?', [req.params.id]);
    res.json({ message: 'Slika obrisana' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;