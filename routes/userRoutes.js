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


router.post("/register", async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password } = req.body;

        // Kiểm tra nếu thiếu bất kỳ trường nào
        if (!fullName || !email || !phoneNumber || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được sử dụng!" });
        }

        // Tạo người dùng mới với đầy đủ thông tin
        const newUser = new userModel({ fullName, email, phoneNumber, password });
        await newUser.save();

        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}); 

// Đăng nhập và tạo token
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra thông tin đăng nhập
        const user = await userModel.findOne({ email, password });
        if (!user) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        // Tạo token đăng nhập
        const token = jwt.sign({ email }, config.SECRETKEY, { expiresIn: "30s" });
        const refreshToken = jwt.sign({ email }, config.SECRETKEY, { expiresIn: "1d" });

        res.json({ message: "Đăng nhập thành công!", token, refreshToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API lấy danh sách user (yêu cầu token)
router.get("/all", authenticateToken, async (req, res) => {
    try {
        const users = await userModel.find().select("-password"); // Không trả về mật khẩu
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;