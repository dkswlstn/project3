//routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const conn = require('../db');

//회원가입
router.post('/register', async (req, res) => {
  const { username, password, name, student_id, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO users (username, password, name, student_id, role) VALUES (?, ?, ?, ?, ?)`;
  conn.query(sql, [username, hashed, name, student_id, role], (err) => {
    if (err) return res.status(500).send('회원가입 실패');
    // ✅ 성공 시 basic.html로 이동
    res.redirect('/html/basic.html');
  });
});

//로그인
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ?';
  conn.query(sql, [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('아이디 또는 비밀번호 오류');

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('비밀번호 오류');

    // ✅ 로그인 성공 시 사용자 정보 JSON으로 응답
    const userInfo = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    };

    res.json(userInfo); // ✅ 프론트에서 이걸 localStorage에 저장하도록
  });
});


//아이디 찾기
router.post('/find-id', (req, res) => {
  console.log('받은 값:', req.body); // 👈 로그 확인
  const { student_id } = req.body;

  const sql = 'SELECT username FROM users WHERE student_id = ?';
  conn.query(sql, [student_id], (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(404).send('일치하는 아이디 없음');
    }
    console.log('조회 결과: ',rows[0]);
    res.json({ username: rows[0].username });
  });
});

//비밀번호 찾기
router.post('/find-password', (req, res) => {
  const { student_id, username } = req.body;
  const sql = `SELECT password FROM users WHERE student_id = ? AND username = ?`;

  conn.query(sql, [student_id, username], (err, rows) => {
    if (err) {
      console.error('DB 오류:', err);
      return res.status(500).json({ success: false, message: 'DB 오류' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '일치하는 사용자 없음' });
    }

    // ✅ 점검: rows[0] 구조 확인
    console.log(rows[0]); // 여기에 password가 실제 있는지 확인

    res.json({ success: true, password: rows[0].password });
  });
});
module.exports = router;