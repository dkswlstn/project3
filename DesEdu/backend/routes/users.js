var express = require('express');
var router = express.Router();

/* 사용자 리스팅 */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
