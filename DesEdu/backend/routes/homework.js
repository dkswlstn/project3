const express = require('express');
const router = express.Router();
const multer = require('multer');
const conn = require('../db');

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 이 경로가 실제로 존재해야 함!
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 전체 과제 목록 조회
router.get('/', (req, res) => {
  const sql = `
    SELECT id, title, professor_name AS author, start_date, end_date, created_at, status
    FROM homework
    ORDER BY created_at DESC
  `;
  conn.query(sql, (err, results) => {
    if (err) {
      console.error('❌ 과제 조회 오류:', err);
      return res.status(500).json({ success: false });
    }
    res.json(results);
  });
});

// ✅ 과제 하나 보기
router.get('/:id', (req, res) => {
  conn.query('SELECT * FROM homework WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: '조회 실패' });
    res.json(results[0]);
  });
});

// ✅ 과제 작성
router.post('/', upload.single('file'), (req, res) => {
  const { title, content, start_date, end_date, professor_name } = req.body;
  const file_path = req.file ? req.file.filename : null;
  const sql = `
    INSERT INTO homework 
    (title, content, start_date, end_date, professor_name, file_path, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, '미제출', NOW())
  `;
  conn.query(sql, [title, content, start_date, end_date, professor_name, file_path], (err, result) => {
    if (err) {
      console.error('❌ INSERT 실패:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, id: result.insertId });
  });
});

// ✅ 과제 수정
router.post('/edit/:id', upload.single('file'), (req, res) => {
  const id = req.params.id;
  const { title, content, start_date, end_date, professor_name } = req.body;
  const filePath = req.file ? req.file.filename : null;

  const sql = filePath
    ? `UPDATE homework SET title=?, content=?, start_date=?, end_date=?, professor_name=?, file_path=? WHERE id=?`
    : `UPDATE homework SET title=?, content=?, start_date=?, end_date=?, professor_name=? WHERE id=?`;

  const params = filePath
    ? [title, content, start_date, end_date, professor_name, filePath, id]
    : [title, content, start_date, end_date, professor_name, id];

  conn.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: '수정 실패', detail: err.message });
    res.status(200).json({ message: '수정 완료' });
  });
});

// ✅ 과제 삭제
router.delete('/:id', (req, res) => {
  conn.query('DELETE FROM homework WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: '삭제 실패' });
    res.json({ message: '삭제 완료' });
  });
});

module.exports = router;
