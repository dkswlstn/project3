const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db'); // MySQL 연결 파일

//파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req,file,cb)=>cb(null,'uploads/'),
    filename: (req,file,cb)=>cb(null,Date.now() + path.extname(file.originalname))
});
const upload = multer({storage});

//공지사항 전체 조회
router.get('/notices', (req, res) => {
  db.query('SELECT * FROM notice ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('공지사항 조회 오류:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

//공지사항 등록
router.post('/notices', upload.single('file'), (req, res) => {
  const { title, content, author } = req.body;
  const file_path = req.file ? req.file.filename : null;

  if (!title || !content || !author) {
    return res.status(400).json({ error: '필수 항목 누락' });
  }

  db.query(
    `INSERT INTO notice (title, content, author, file_path) VALUES (?, ?, ?, ?)`,
    [title, content, author, file_path],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ success: true });
    }
  );
});

//공지사항 단일 조회
router.get('/notices/:id',(req,res)=>{
    db.query(`SELECT * FROM notice WHERE id = ?`
        ,[req.params.id],(err,result)=>{
            if(err) return res.status(500).send(err);
            res.json(result[0]);
        });
});

//공지사항 수정
router.put('/notices/:id',upload.single('file'),(req,res)=>{
    const {title, content}=req.body;
    const file_path = req.file ? req.file.filename : null;

    const query = file_path 
        ? `UPDATE notice SET title = ?, content = ?, file_path = ? WHERE id = ?`
        : `UPDATE notice SET title = ?, content = ? WHERE id = ?`;
    const params = file_path ? [title,content,file_path,req.params.id] : [title, content, req.params.id];

    db.query(query, params, (err)=>{
        if(err) return res.status(500).send(err);
        res.json({success:true});
    });
});

//공지사항 삭제
router.delete('/notices/:id',(req,res)=>{
    db.query(`DELETE FROM notice WHERE id = ?`, [req.params.id],(err)=>{
        if(err) return res.status(500).send(err);
        res.json({success:true});
    });
});

module.exports = router;