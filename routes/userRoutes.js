const express = require('express');
const userModel = require('../models/userModel');

const JWT = require('jsonwebtoken');
const config = require("../ultil/tokenConfig");
const { token } = require('morgan');


require('dotenv').config();

const router = express.Router();


router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;
      
        // Sử dụng `await` để lấy dữ liệu từ database
        const user = await userModel.findOne({email: email, password: password});
        
        if (!user) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        // Tạo token nếu đăng nhập thành công
        const token = JWT.sign({ email: email }, config.SECRETKEY, { expiresIn: '30s' });
        const refreshToken = JWT.sign({ email: email }, config.SECRETKEY, { expiresIn: '1d' });

        res.json({ message: "Đăng nhập thành công!", token: token, refreshToken: refreshToken });

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
