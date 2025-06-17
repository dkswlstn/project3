const express = require('express');
const router = express.Router();
const conn = require('../db');

// 수강 신청
router.post('/register', (req, res) => {
  const user_id = req.session.userId; // 세션에서 가져옴
  const { course_id } = req.body;

  if (!user_id || !course_id) return res.status(400).send('필드 누락');

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
  const user_id = req.session.userId; // 세션에서 가져옴
  const { course_id } = req.body;

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
router.get('/registered', (req, res) => {
  const userId = req.session.userId; // 세션 기반으로 변경
  if (!userId) return res.status(401).send('로그인 필요');

  conn.query('SELECT * FROM registered_courses WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      console.error('[DB 오류]', err);
      return res.status(500).send('수강 목록 조회 실패');
    }
    res.json(rows);
  });
});

//시간표 자동 반영 (사용자별 신청한 과목 시간표)
router.get('/registered-courses', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).send('로그인 필요');

  conn.query(`
    SELECT ac.subject, ac.professor, ac.credit, ac.time, rc.registered_at
    FROM registered_courses rc
    JOIN available_courses ac ON rc.course_id = ac.id
    WHERE rc.user_id = ?
  `, [userId], (err, rows) => {
    if (err) {
      console.error('시간표 조회 오류: ', err);
      return res.status(500).send('서버 오류');
    }
    res.json(rows);
  });
});

module.exports = router;