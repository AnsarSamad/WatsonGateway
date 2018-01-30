var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/validate', function(req, res, next) {
  res.json("valid user");
});

module.exports = router;
