const express = require('express');
const userModel = require('../models/userModel');
const JWT = require('jsonwebtoken');
const config = require("../ultil/tokenConfig");

require('dotenv').config();
const router = express.Router();

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Không có token, vui lòng đăng nhập!" });
    }

    JWT.verify(token, config.SECRETKEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token không hợp lệ!" });
        }
        req.user = user; // Lưu thông tin user vào request
        next();
    });
};

// Đăng nhập và tạo token
router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;
      
        // Sử dụng `await` để lấy dữ liệu từ database
        const user = await userModel.findOne({ email, password });
        
        if (!user) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        // Tạo token nếu đăng nhập thành công
        const token = JWT.sign({ email: email }, config.SECRETKEY, { expiresIn: '30s' });
        const refreshToken = JWT.sign({ email: email }, config.SECRETKEY, { expiresIn: '1d' });

        res.json({ message: "Đăng nhập thành công!", token, refreshToken });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API lấy danh sách user (yêu cầu token)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await userModel.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
