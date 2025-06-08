const express = require('express');
const router = express.Router();
const conn = require('../db');

// 수강 신청
router.post('/register', (req, res) => {
  const { user_id, course_id } = req.body;
  conn.query('SELECT * FROM available_courses WHERE id = ?', [course_id], (err, result) => {
    if (err || result.length === 0) return res.status(400).send('강의 없음');
    const course = result[0];
    conn.query(`
      INSERT INTO registered_courses (subject, professor, credit, user_id, course_id)
      VALUES (?, ?, ?, ?, ?)`,
      [course.subject, course.professor, course.credit, user_id, course_id],
      err => {
        if (err) return res.status(500).send('신청 실패');
        res.sendStatus(200);
      });
  });
});

// 수강 취소
router.post('/unregister', (req, res) => {
  const { user_id, course_id } = req.body;

  if (!user_id || !course_id) return res.status(400).send('필드 누락');

  conn.query(
    'DELETE FROM registered_courses WHERE user_id = ? AND course_id = ?',
    [user_id, course_id],
    (err, result) => {
      if (err) {
        console.error('[수강취소 오류]', err);
        return res.status(500).send('삭제 실패');
      }

      if (result.affectedRows === 0) {
        return res.status(404).send('해당 데이터 없음');
      }

      res.sendStatus(200);
    });
});

// 신청 강의 목록
router.get('/registered/:userId', (req, res) => {
  const userId = req.params.userId;
  conn.query('SELECT * FROM registered_courses WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      console.error('[DB 오류]', err);
      return res.status(500).send('수강 목록 조회 실패');
    }
    res.json(rows);
  });
});

module.exports = router;