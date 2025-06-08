var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var syllabusRouter = require('./routes/syllabus');
var coursesRouter = require('./routes/courses');
var registerRouter = require('./routes/registration');
var gradeRouter = require('./routes/grades');
var noticeRouter = require('./routes/notice');
var homeworkRouter = require('./routes/homework');
var myInfoRouter = require('./routes/myInfo');
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public/html'))); //프론트엔드
app.use(express.static(path.join(__dirname,'../public'))); //사진 및 기타 파일 전용
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth',authRouter);
app.use('/api',syllabusRouter);
app.use('/api',coursesRouter);
app.use('/api',registerRouter);
app.use('/api',gradeRouter);
app.use('/api',noticeRouter);
app.use('/api/homework',homeworkRouter);
app.use('/api/myinfo', myInfoRouter);

module.exports = app;
