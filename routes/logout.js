var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {

  req.session = null;
  res.redirect('login');
  return;
});

module.exports = router;
