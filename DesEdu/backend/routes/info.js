const express = require('express');
const router = express.Router();
const conn = require('../db');
const multer = require('multer');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
  })
});
//과목 목록 반환
router.get('/api/my-courses', (req, res) => {
  const user_id = req.query.user_id;
  db.query('SELECT subject_name as name FROM subject_table WHERE user_id = ?', [user_id], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json(results);
  });
});

// GET /api/infos
router.get('/', (req, res) => {
  const sql = `SELECT id, title, author, subject, created_at, filename, filepath FROM resource ORDER BY created_at DESC`;
  conn.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json(results);
  });
});

// GET /api/infos/:id
router.get('/:id', (req, res) => {
  conn.query('SELECT * FROM resource WHERE id = ?', [req.params.id], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ success: false });
    res.json(result[0]);
  });
});

// POST /api/infos
router.post('/', upload.single('file'), (req, res) => {
  const { title, content, author, subject } = req.body;
  const file = req.file;

  const sql = `
    INSERT INTO resource (title, content, author, subject, created_at, filename, filepath, filesize)
    VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)
  `;
  const values = [
    title, content, author, subject,
    file?.originalname || null,
    file?.path || null,
    file?.size || null
  ];

  conn.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, id: result.insertId });
  });
});

// PUT /api/infos/:id
router.put('/:id', upload.single('file'), (req, res) => {
  const { title, content, author } = req.body;
  const file = req.file;

  const sql = `
    UPDATE resource
    SET title = ?, content = ?, author = ?, 
        filename = ?, filepath = ?, filesize = ?
    WHERE id = ?
  `;

  const values = [
    title,
    content,
    author,
    file?.originalname || null,
    file?.path || null,
    file?.size || null,
    req.params.id
  ];

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.error('자료 수정 오류:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

// DELETE /api/infos/:id
router.delete('/:id', (req, res) => {
  conn.query('DELETE FROM resource WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

module.exports = router;