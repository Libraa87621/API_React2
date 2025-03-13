const express = require('express');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
require('dotenv').config();

const router = express.Router();

// Middleware kiểm tra token
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 401, message: "Token không hợp lệ!" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ status: 403, error: "Token không hợp lệ!" });
        }
        req.userId = decoded.userId; // Lưu userId vào request để sử dụng
        next();
    });
};

// Đăng nhập và tạo token + refresh token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Kiểm tra email có tồn tại không
        const user = await User.findOne({ email });
        if (!user || password !== user.password) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        // Tạo Access Token (30s) và Refresh Token (1h)
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30s' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
