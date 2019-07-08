var express = require('express');
var router = express.Router();
var path = require('path');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/documentation', ( req, res) =>{
  res.sendFile(path.resolve('public/docs/apidoc/index.html'));
});
module.exports = router;
