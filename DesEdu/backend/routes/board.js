const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

//파일 업로드 및 경로 설정
const upload = multer({
    storage: multer.diskStorage({
        destination: (req,file,cb)=>{
            const dir = path.join(__dirname, '../uploads');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            cb(null,dir);
        },
        filename: (req,file,cb)=>{
            // 한글 깨짐 방지를 위해 원래 이름 사용 금지
            const ext = path.extname(file.originalname);
            cb(null,Date.now() + ext); // 원래 이름 대신 타임스탬프 + 확장자
        }
    })
});

//글 작성하기
router.post('/write', upload.single('file'), async (req, res) => {
  const { title, content } = req.body;
  const file = req.file;

  try {
    await db.execute(
      `INSERT INTO tbl_board (title, content, filename, originalname, mimetype, date)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        title,
        content,
        file?.filename || null,
        file?.originalname || null,
        file?.mimetype || null,
      ]
    );
    res.redirect('/board.html');
  } catch (err) {
    console.error(err);
    res.status(500).send('DB 오류');
  }
});

// 글 목록 조회
router.get('/', (req, res) => {
  const sql = 'SELECT id, title, date FROM tbl_board ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB 조회 오류:', err);
      return res.status(500).send('DB 조회 오류');
    }
    res.json(results);  // results는 rows 배열
  });
});


// 글 보기 (DB 기반)
// 수정된 코드: mysql에서 작동하는 콜백 기반
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).send('잘못된 요청입니다.');

  const sql = `SELECT * FROM tbl_board WHERE id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB 조회 오류:', err);
      return res.status(500).send('DB 조회 오류');
    }
    if (results.length === 0) return res.status(404).send('게시글을 찾을 수 없습니다.');
    res.json(results[0]); // 첫 번째 게시글 반환
  });
});

// 글 수정하기 (DB 기반)
router.post('/edit/:id', upload.single('file'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  const file = req.file;

  try {
    // 파일 업로드 여부에 따라 SQL 분기
    if (file) {
      await db.execute(
        `UPDATE tbl_board 
         SET title = ?, content = ?, filename = ?, originalname = ?, mimetype = ? 
         WHERE id = ?`,
        [title, content, file.filename, file.originalname, file.mimetype, id]
      );
    } else {
      await db.execute(
        `UPDATE tbl_board 
         SET title = ?, content = ? 
         WHERE id = ?`,
        [title, content, id]
      );
    }

    res.redirect('/board.html');
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).send('DB 수정 오류');
  }
});

//글 삭제하기
router.delete('/:id',(req,res)=>{
  const id = parseInt(req.params.id);
  if(isNaN(id)) return res.status(400).send('잘못된 요청입니다.');

  const sql = `DELETE FROM tbl_board WHERE id = ?`;
  db.query(sql,[id],(err, result)=>{
    if(err){
      console.error('삭제 오류',err);
      return res.status(500).send('DB 삭제 오류');
    }
    if(result.affectedRows === 0) return res.status(404).send('게시글을 찾을 수가 없습니다.');
    res.sendStatus(200); // 성공 응답
  })
})
module.exports = router;