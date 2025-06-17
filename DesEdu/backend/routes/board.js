const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + ext);
    }
  })
});

// GET /api/board
router.get('/', (req, res) => {
  db.query('SELECT id, title, date FROM tbl_board ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).send('DB 조회 오류');
    res.json(results);
  });
});

// GET /api/board/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.query('SELECT * FROM tbl_board WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).send('게시글 없음');
    res.json(results[0]);
  });
});

// POST /api/board/write
router.post('/write', upload.single('file'), async (req, res) => {
  const { title, content } = req.body;
  const file = req.file;

  try {
    await db.execute(
      `INSERT INTO tbl_board (title, content, filename, originalname, mimetype, date)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [title, content, file?.filename || null, file?.originalname || null, file?.mimetype || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).send('DB 오류');
  }
});

// POST /api/board/edit/:id
router.post('/edit/:id', upload.single('file'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  const file = req.file;

  try {
    if (file) {
      await db.execute(
        `UPDATE tbl_board SET title=?, content=?, filename=?, originalname=?, mimetype=? WHERE id=?`,
        [title, content, file.filename, file.originalname, file.mimetype, id]
      );
    } else {
      await db.execute(`UPDATE tbl_board SET title=?, content=? WHERE id=?`, [title, content, id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).send('DB 수정 오류');
  }
});

// DELETE /api/board/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.query('DELETE FROM tbl_board WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send('DB 삭제 오류');
    if (result.affectedRows === 0) return res.status(404).send('게시글 없음');
    res.sendStatus(200);
  });
});

module.exports = router;