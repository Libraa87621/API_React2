require('dotenv').config();
const mongoose = require("mongoose");
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Kết nối MongoDB (ĐÃ SỬA LỖI)
mongoose.connect('mongodb+srv://Libraaa:2692005@cluster0.olub1.mongodb.net/React2')
.then(() => console.log("✅ Kết nối thành công MongoDB"))
.catch(err => console.log("❌ Lỗi kết nối MongoDB:", err));

// Cấu hình view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);

// Xử lý lỗi 404
app.use((req, res, next) => {
    next(createError(404));
});

// Xử lý lỗi server
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
