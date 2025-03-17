const jwt = require('jsonwebtoken');
const config = require('../ultil/tokenConfig'); 

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header

    if (!token) {
        return res.status(401).json({ message: "Không có token, vui lòng đăng nhập!" });
    }

    jwt.verify(token, config.SECRETKEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
        }
        req.user = user; // Gán user vào request
        next();
    });
};

module.exports = authenticateToken;
