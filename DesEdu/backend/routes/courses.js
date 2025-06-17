const express = require('express');
const router = express.Router();
const conn = require('../db');

//강의 목록
router.get('/courses', (req,res)=>{
    conn.query(`
        SELECT c.id, c.subject, c.professor, c.credit, c.time, s.email
        FROM available_courses c
        LEFT JOIN syllabus s ON c.syllabus_id = s.id
    `, (err, rows) => {
        if(err){
            console.error('[DB 오류]',err);
            return res.status(500).send('강의 목록 조회 실패');
        }
        res.json(rows);
    });
});

// 로그인한 사용자의 수강 과목 목록 반환
router.get('/my-courses', (req, res) => {
  const user_id = req.query.user_id;

  const sql = `
    SELECT DISTINCT c.id, c.subject AS name
    FROM registered_courses rc
    JOIN available_courses c ON rc.course_id = c.id
    WHERE rc.user_id = ?
  `;

  conn.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('과목 목록 조회 오류:', err);
      return res.status(500).send('서버 오류');
    }
    res.json(results); // [{ id: 1, name: 'C프로그래밍 수업' }, ...]
  });
});

router.get('/api/registered', (req, res) => {
  const user_id = req.session.user_id; // 또는 테스트용 고정값
  const sql = `
    SELECT c.id as course_id, c.subject, c.professor, c.credit
    FROM registered_courses r
    JOIN available_courses c ON r.course_id = c.id
    WHERE r.user_id = ?
  `;

  conn.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('신청 목록 조회 오류:', err);
      return res.status(500).json({ error: '서버 오류' });
    }
    res.json(results);
  });
});

// ✅ 수강 신청된 과목 목록 조회
router.get('/api/registered-courses', (req, res) => {
  // 실제 서비스에서는 req.session.user_id에서 가져옵니다.
  const user_id = req.session?.user_id || 4; // 테스트용 기본값 4

  const sql = `
    SELECT 
      c.id AS course_id,
      c.subject,
      c.professor,
      c.credit,
      c.time AS time     -- 프론트에서 course.time 으로 받기 위함
    FROM registered_courses r
    JOIN available_courses c ON r.course_id = c.id
    WHERE r.user_id = ?
  `;

  conn.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('[수강 과목 조회 오류]', err);
      return res.status(500).json({ success: false, message: '수강 과목 조회 실패' });
    }
    res.json(results);
  });
});



module.exports = router;