const express = require('express');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const config = require("../ultil/tokenConfig");
const authenticateToken = require("../middleware/authenticateToken"); // Middleware xác thực

const router = express.Router();

// Đăng nhập và tạo token
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu!" });
        }

        const user = await userModel.findOne({ email: email.trim().toLowerCase(), password });
        if (!user) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        // Tạo token JWT
        const token = jwt.sign({ userId: user._id, email: user.email }, config.SECRETKEY, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ userId: user._id, email: user.email }, config.SECRETKEY, { expiresIn: "7d" });

        res.json({ message: "Đăng nhập thành công!", token, refreshToken, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Đăng ký tài khoản
router.post("/register", async (req, res) => {
    try {
        let { fullName, email, phoneNumber, password } = req.body;

        if (!fullName || !email || !phoneNumber || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        email = email.trim().toLowerCase(); // Chuẩn hóa email

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại!" });
        }

        const newUser = new userModel({ fullName, email, phoneNumber, password });
        await newUser.save();
        
        res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API lấy danh sách user (Chỉ Admin mới có quyền)
router.get("/all", authenticateToken, async (req, res) => {
    try {
        const users = await userModel.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API tìm kiếm user theo tên
router.get("/search", authenticateToken, async (req, res) => {
    try {
        const { name } = req.query;
        
        if (!name) {
            return res.status(400).json({ message: "Vui lòng nhập tên cần tìm!" });
        }

        const users = await userModel.find({ 
            fullName: { $regex: name, $options: "i" }
        }).select('-password');

        if (users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng nào!" });
        }

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
