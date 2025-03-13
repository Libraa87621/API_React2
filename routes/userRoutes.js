const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require("../models/userModel");
require('dotenv').config();

const router = express.Router();
// API Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Kiểm tra email có tồn tại không
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
      }

      // So sánh mật khẩu
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
      }

      // Tạo JWT Token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d" // Token hết hạn sau 7 ngày
      });

      res.json({ message: "Đăng nhập thành công!", token });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

module.exports = router;