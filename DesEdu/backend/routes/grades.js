const express = require('express');
const router = express.Router();
const conn = require('../db');

// 성적 전체 조회
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      year, 
      semester, 
      subject_name, 
      IFNULL(professor_name, '미지정') AS professor_name,
      grade
    FROM grades
    ORDER BY id DESC
  `;
  conn.query(sql, (err, results) => {
    if (err) {
      console.error('성적 조회 오류:', err);
      return res.status(500).json({ success: false, message: '성적 조회 실패' });
    }
    res.json(results);
  });
});

// 성적 입력
router.post('/', (req, res) => {
  const {
    student_id,
    student_name,
    subject_name,
    year,
    semester,
    grade,
    professor_name
  } = req.body;

  const sql = `
    INSERT INTO grades 
    (student_id, student_name, subject_name, year, semester, grade, professor_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  conn.query(sql, [
    student_id, student_name, subject_name,
    year, semester, grade, professor_name || null
  ], (err, result) => {
    if (err) {
      console.error('성적 입력 오류:', err);
      return res.status(500).json({ success: false, message: '성적 입력 실패' });
    }
    res.json({ success: true, message: '성적 입력 완료' });
  });
});

module.exports = router;
