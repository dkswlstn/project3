const express = require('express');
const router = express.Router();
const conn = require('../db');
const multer = require('multer');
const path = require('path');

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

// 자료 목록 조회
router.get('/', (req, res) => {
  const sql = `
    SELECT id, title, author, subject, created_at, filename, filepath
    FROM resource
    ORDER BY created_at DESC
  `;
  conn.query(sql, (err, results) => {
    if (err) {
      console.error('❌ 자료 목록 조회 오류:', err);
      return res.status(500).json({ success: false });
    }
    res.json(results);
  });
});


// 자료 상세 조회
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM resource WHERE id = ?`;
  conn.query(sql, [id], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ success: false });
    res.json(result[0]);
  });
});

// 자료 등록
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
    if (err) {
      console.error('❌ 자료 작성 오류:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, id: result.insertId });
  });
});

// 자료 수정
router.put('/:id', upload.single('file'), (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const file = req.file;

  const sql = `
    UPDATE resource
    SET title = ?, content = ?, 
        filename = ?, filepath = ?, filesize = ?
    WHERE id = ?
  `;
  const values = [
    title,
    content,
    file?.originalname || null,
    file?.path || null,
    file?.size || null,
    id
  ];

  conn.query(sql, values, (err) => {
    if (err) {
      console.error('❌ 자료 수정 오류:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

// 자료 삭제
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM resource WHERE id = ?`;
  conn.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ 자료 삭제 오류:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

module.exports = router;