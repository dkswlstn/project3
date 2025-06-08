//roues/syllabus.js
const express = require('express');
const router = express.Router();
const conn = require('../db');

router.get('/syllabus',(req,res)=>{
    conn.query('SELECT * FROM syllabus',(err,rows)=>{
        if(err){
            console.error('[DB 오류]',err);
            return res.status(500).send('DB 조회 실패');
        }
        res.json(rows);
    });
});

module.exports = router;