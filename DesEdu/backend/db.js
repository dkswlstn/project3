// db.js
const mysql = require('mysql2');

const conn = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:'1234',
    database: 'desedu',
});

conn.connect(err=>{
    if (err) {
    console.error('DB 연결 실패:', err);
  } else {
    console.log('MySQL 연결 성공');
  }
});

module.exports = conn;