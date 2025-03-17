const express = require('express');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const config = require("../ultil/tokenConfig");

require('dotenv').config();
const router = express.Router();

// Đăng nhập và tạo token
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu!" });
        }

        // Kiểm tra thông tin đăng nhập
        const user = await userModel.findOne({ email: email.trim().toLowerCase(), password });
        if (!user) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        // Tạo token đăng nhập
        const token = jwt.sign({ userId: user._id, email: user.email }, config.SECRETKEY, { expiresIn: "30s" });
        const refreshToken = jwt.sign({ userId: user._id, email: user.email }, config.SECRETKEY, { expiresIn: "1d" });

        res.json({ message: "Đăng nhập thành công!", token, refreshToken, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Đăng ký người dùng mới (Không dùng bcrypt)
router.post("/register", async (req, res) => {
    try {
        let { fullName, email, phoneNumber, password } = req.body;

        if (!fullName || !email || !phoneNumber || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        email = email.trim().toLowerCase(); // Chuẩn hóa email

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại!" });
        }

        // Lưu người dùng vào database
        const newUser = new userModel({ fullName, email, phoneNumber, password });

        await newUser.save();
        res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Không có token, vui lòng đăng nhập!" });
    }

    jwt.verify(token, config.SECRETKEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
        }
        req.user = user;
        next();
    });
};

// Lấy danh sách người dùng (chỉ dành cho admin)
router.get("/all", authenticateToken, async (req, res) => {
    try {
        const users = await userModel.find().select('-password'); // Ẩn mật khẩu khi trả về
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Tìm kiếm người dùng theo tên
router.get("/search", authenticateToken, async (req, res) => {
    try {
        const { name } = req.query;
        
        if (!name) {
            return res.status(400).json({ message: "Vui lòng nhập tên cần tìm!" });
        }

        const users = await userModel.find({ 
            fullName: { $regex: name, $options: "i" } // Tìm kiếm không phân biệt chữ hoa/thường
        }).select('-password'); // Ẩn mật khẩu khi trả về

        if (users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng nào!" });
        }

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
