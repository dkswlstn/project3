//routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const conn = require('../db');

// 회원가입하기
router.post('/register', async (req, res) => {
  const { username, password, name, student_id, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO users (username, password, name, student_id, role) VALUES (?, ?, ?, ?, ?)`;
  conn.query(sql, [username, hashed, name, student_id, role], (err) => {
    if (err) return res.status(500).send('회원가입 실패');
    res.redirect('/html/basic.html');
  });
});

// 로그인하기
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await conn.promise().query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];

    if (!user) return res.json({ success: false, message: '사용자 없음' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: '비밀번호 틀림' });

    // ✅ 세션에 userId 저장
    req.session.userId = user.id;
    
    // 로그인 성공
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 아이디 찾기
router.post('/find-id', (req, res) => {
  const { student_id } = req.body;
  const sql = 'SELECT username FROM users WHERE student_id = ?';

  conn.query(sql, [student_id], (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(404).send('일치하는 아이디 없음');
    }
    res.json({ username: rows[0].username });
  });
});

// 비밀번호 찾기
router.post('/find-password', (req, res) => {
  const { student_id, username } = req.body;
  const sql = `SELECT password FROM users WHERE student_id = ? AND username = ?`;

  conn.query(sql, [student_id, username], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'DB 오류' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '일치하는 사용자 없음' });
    }
    res.json({ success: true, password: rows[0].password });
  });
});

// 로그아웃
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('세션 종료 오류:', err);
    }
    res.redirect('/basic.html');
  });
});

module.exports = router;
