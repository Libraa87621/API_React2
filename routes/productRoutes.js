const express = require('express');
const router = express.Router();
const Product = require('../models/productModel'); // Kiểm tra lại đường dẫn

// Lấy tất cả sản phẩm
router.get('/all', async (req, res) => {
  try {
    let query = {};
    if (req.query.search) {
      query = { $text: { $search: req.query.search } };
    }

    // Lấy danh sách sản phẩm và kèm theo category nếu có
    const products = await Product.find(query).populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
