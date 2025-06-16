// routes/myInfo.js
const express = require('express');
const router = express.Router();
const db = require('../db'); //db 연결 객체
const bcrypt = require('bcrypt');

// POST /api/myinfo/verify
router.post('/verify', (req, res) => {
  const { username, password } = req.body;
  console.log('🔍 입력된 username:', username);
  console.log('🔍 입력된 password:', password);

  const query = `SELECT * FROM users WHERE username = ?`;
  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length > 0) {
      console.log('✅ DB에서 찾은 password:', results[0].password);
      const match = bcrypt.compareSync(password, results[0].password); // ✅ 해시 비교
      return res.json({ success: match });
    } else {
      console.log('❌ ID에 해당하는 사용자 없음');
      res.json({ success: false });
    }
  });
});


// POST /api/myinfo/update
router.post('/update', async (req, res) => {
  const { username, email, phone, password } = req.body;

  try {
    let query, params;

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE users 
        SET email = ?, phone = ?, password = ?
        WHERE username = ?
      `;
      params = [email, phone, hashedPassword, username];
    } else {
      query = `
        UPDATE users 
        SET email = ?, phone = ?
        WHERE username = ?
      `;
      params = [email, phone, username];
    }

    db.query(query, params, (err, result) => {
      if (err) {
        console.error('DB update error:', err);
        return res.status(500).json({ success: false, message: '서버 오류' });
      }
      res.json({ success: true, message: '정보가 성공적으로 업데이트되었습니다.' });
    });
  } catch (err) {
    console.error('Hashing error:', err);
    res.status(500).json({ success: false, message: '비밀번호 해싱 실패' });
  }
});

//사용자 정보 조회
router.get('/:username', (req, res) => {
  const username = req.params.username;
  const query = `SELECT username AS id, name, student_id, email, phone FROM users WHERE username = ?`;

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('DB 오류:', err);
      return res.status(500).json({ success: false, message: 'DB 오류' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: '사용자 없음' });
    }

    res.json({ success: true, user: results[0] });
  });
});

module.exports = router;