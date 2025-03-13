const express = require('express');
const User = require("../models/userModel");
const userModel = require('../models/userModel');
require('dotenv').config();

const router = express.Router();


// Đăng nhập và tạo token + refresh token
router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;
      
        const user = userModel.find({email: email, password: password});
        if (!user || password !== user.password) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        res.json({ message: "Đăng nhập thành công!", accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API lấy danh sách user (yêu cầu token)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
