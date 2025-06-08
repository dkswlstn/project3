// routes/myInfo.js
const express = require('express');
const router = express.Router();
const db = require('../db'); //db 연결 객체

// POST /api/myinfo/verify
router.post('/verify', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE id = ? AND password = ?`;

  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

// POST /api/myinfo/update
router.post('/update',(req,res)=>{
    const {username, email, phone, password}=req.body;

    const query = `
    UPDATE users 
    SET email = ?, phone = ?, password = ?
    WHERE username = ?
    `;

    db.query(query, [email, phone, password, username], (err, result) => {
    if (err) {
      console.error('DB update error:', err);
      return res.status(500).json({ success: false, message: '서버 오류' });
    }
    res.json({ success: true, message: '정보가 성공적으로 업데이트되었습니다.' });
  });
});

module.exports = router;