const express = require('express');
const router = express.Router();
const conn = require('../db');

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

module.exports = router;