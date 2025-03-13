const express = require('express');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
require('dotenv').config();

const router = express.Router();

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided!" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Forbidden: Invalid token!" });

        req.user = decoded; // Lưu user vào request
        next();
    });
};

// API Đăng nhập (Không dùng bcrypt)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Kiểm tra email có tồn tại không
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        // So sánh mật khẩu trực tiếp
        if (password !== user.password) {
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

// API lấy tất cả người dùng (yêu cầu token)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Ẩn password khi trả về
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
