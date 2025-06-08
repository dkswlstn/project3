const express = require('express');
const router = express.Router();
const conn = require('../db');

// 전체 성적 조회 (관리자용 또는 디버깅용)
router.get('/grades', (req, res) => {
  conn.query(`SELECT * FROM grades`, (err, results) => {
    if (err) return res.status(500).send('DB 오류');
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const {
    student_id, student_name, subject_name,
    year, semester, grade, professor_name
  } = req.body;

  const sql = `
    INSERT INTO grades (student_id, student_name, subject_name, year, semester, grade, professor_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  conn.query(sql, [student_id, student_name, subject_name, year, semester, grade, professor_name], (err) => {
    if (err) {
      console.error(err); // ✅ 콘솔 로그로 에러 확인
      return res.status(500).send('DB 저장 실패');
    }
    res.send('성적 저장 완료');
  });
});

module.exports = router;