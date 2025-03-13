var express = require('express');
var router = express.Router();
var User = require("../models/userModel");

// API lấy tất cả người dùng
router.get('/all', async function(req, res) {
  try {
      const list = await User.find();
      res.json(list);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

module.exports = router;
