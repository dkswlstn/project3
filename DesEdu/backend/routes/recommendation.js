// routes/recommendation.js
const express = require('express');
const router = express.Router();
const conn= require('../db'); // MySQL 연결 모듈

// 진로 목록 조회
router.get('/careers', async (req, res) => {
  try {
    const [rows] = await conn.promise().query('SELECT * FROM career_goals');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '진로 목록 조회 실패', error: err });
  }
});

// 진로 ID 기반 추천 교과목 조회
router.get('/recommendations/:id', async (req, res) => {
  const careerId = req.params.id;
  try {
    const [rows] = await conn.promise().query(`
      SELECT rc.course_name, rc.status
      FROM recommend_courses rc
      JOIN course_career_map ccm ON rc.id = ccm.course_id
      WHERE ccm.career_id = ?
    `, [careerId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '추천 과목 조회 실패', error: err });
  }
});

module.exports = router;
