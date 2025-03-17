const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const authenticateToken = require('../middleware/authenticateToken'); // Middleware xác thực

// Lấy tất cả sản phẩm (yêu cầu token)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.query.search) {
      query = { $text: { $search: req.query.search } };
    }

    const products = await Product.find(query).populate('category');
    
    if (products.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm nào!" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server! Vui lòng thử lại sau." });
  }
});

// Thêm sản phẩm mới (yêu cầu token)
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin sản phẩm!" });
    }

    const newProduct = new Product({ name, price, category, description });
    await newProduct.save();
    
    res.status(201).json({ message: "Thêm sản phẩm thành công!", product: newProduct });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server! Không thể thêm sản phẩm." });
  }
});

// Cập nhật sản phẩm (yêu cầu token)
router.put('/update/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại!" });
    }

    res.status(200).json({ message: "Cập nhật sản phẩm thành công!", product: updatedProduct });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server! Không thể cập nhật sản phẩm." });
  }
});

// Xóa sản phẩm (yêu cầu token)
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại!" });
    }

    res.status(200).json({ message: "Xóa sản phẩm thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server! Không thể xóa sản phẩm." });
  }
});

module.exports = router;
