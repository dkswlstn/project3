var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var syllabusRouter = require('./routes/syllabus');
var coursesRouter = require('./routes/courses');
var registrationRouter = require('./routes/registration');
var gradesRouter = require('./routes/grades');
var noticeRouter = require('./routes/notice');
var homeworkRouter = require('./routes/homework');
var myInfoRouter = require('./routes/myInfo');
var boardRouter = require('./routes/board');
var infoRouter = require('./routes/info');
var recommendRouter = require('./routes/recommendation');
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'mySecretKey', // 원하는 키로 설정
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS 환경에서는 true로 바꿔야 함
}));

app.use(express.static(path.join(__dirname, '../public/html'))); //프론트엔드
app.use(express.static(path.join(__dirname, '../public')));    // 이미지나 기타 파일용(선택)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth',authRouter);
app.use('/api',syllabusRouter);
app.use('/api',coursesRouter);
app.use('/api',registrationRouter);
app.use('/api/grades',gradesRouter);
app.use('/api',noticeRouter);
app.use('/api/homeworks',homeworkRouter);
app.use('/api/myinfo', myInfoRouter);
app.use('/api/board', boardRouter);
app.use('/api/infos', infoRouter);
app.use('/api',recommendRouter);

module.exports = app;
