const express = require('express');
const userModel = require('../models/userModel');
const JWT = require('jsonwebtoken');
const config = require("../ultil/tokenConfig");

require('dotenv').config();
const router = express.Router();

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
// Đăng ký người dùng mới (Không dùng bcrypt)
router.post("/register", async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại!" });
        }

        // Lưu người dùng vào database (Không mã hóa mật khẩu)
        const newUser = new userModel({
            fullName,
            email,
            phoneNumber,
            password
        });

        await newUser.save();
        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách người dùng
router.get("/all", async (req, res) => {
    try {
        const users = await userModel.find().select('-password'); // Loại bỏ mật khẩu khi trả về danh sách
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;