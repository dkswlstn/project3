const express = require('express');
const router = express.Router();
const multer = require('multer');
const conn = require('../db');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  })
});

// GET /api/homeworks
router.get('/', (req, res) => {
  conn.query('SELECT * FROM homework ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json(results);
  });
});

// GET /api/homeworks/:id
router.get('/:id', (req, res) => {
  conn.query('SELECT * FROM homework WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(results[0]);
  });
});

// POST /api/homeworks
router.post('/', upload.single('file'), (req, res) => {
  const { title, content, start_date, end_date, professor_name } = req.body;
  const file_path = req.file?.filename || null;

  conn.query(
    'INSERT INTO homework (title, content, start_date, end_date, professor_name, file_path, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [title, content, start_date, end_date, professor_name, file_path],
    (err, result) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, id: result.insertId });
    }
  );
});

// POST /api/homeworks/edit/:id
router.post('/edit/:id', upload.single('file'), (req, res) => {
  const { title, content, start_date, end_date, professor_name } = req.body;
  const file_path = req.file?.filename || null;

  const sql = file_path
    ? 'UPDATE homework SET title=?, content=?, start_date=?, end_date=?, professor_name=?, file_path=? WHERE id=?'
    : 'UPDATE homework SET title=?, content=?, start_date=?, end_date=?, professor_name=? WHERE id=?';
  const params = file_path
    ? [title, content, start_date, end_date, professor_name, file_path, req.params.id]
    : [title, content, start_date, end_date, professor_name, req.params.id];

  conn.query(sql, params, err => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: 'Updated' });
  });
});

// DELETE /api/homeworks/:id
router.delete('/:id', (req, res) => {
  conn.query('DELETE FROM homework WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ message: 'Deleted' });
  });
});

module.exports = router;