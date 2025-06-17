//notice.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET /api/notices
router.get('/', (req, res) => {
  db.query('SELECT * FROM notice ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// GET /api/notices/:id
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM notice WHERE id = ?', [req.params.id], (err, result) => {
    if (err || result.length === 0) return res.status(404).send('Not found');
    res.json(result[0]);
  });
});

// POST /api/notices
router.post('/', upload.single('file'), (req, res) => {
  const { title, content, author } = req.body;  // ✅ subject 제거
  const file_path = req.file?.filename || null;

  const sql = `
    INSERT INTO notice (title, content, author, file_path, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [title, content, author, file_path], (err) => {
    if (err) {
      console.error('Insert failed:', err);  // 디버깅 로그
      return res.status(500).send('Insert failed');
    }
    res.status(201).send('Created');
  });
});

// POST /api/notices/edit/:id
router.post('/edit/:id', upload.single('file'), (req, res) => {
  const { title, content } = req.body;
  const file_path = req.file?.filename || null;

  const sql = file_path
    ? 'UPDATE notice SET title = ?, content = ?, file_path = ? WHERE id = ?'
    : 'UPDATE notice SET title = ?, content = ? WHERE id = ?';
  const params = file_path
    ? [title, content, file_path, req.params.id]
    : [title, content, req.params.id];

  db.query(sql, params, err => {
    if (err) return res.status(500).send('Update failed');
    res.send('Updated');
  });
});

// DELETE /api/notices/:id
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM notice WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).send('Delete failed');
    res.send('Deleted');
  });
});

module.exports = router;