// Yêu cầu: Sử dụng biến môi trường
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Food = require('./models/Food');

const app = express();

// Middleware xử lý JSON và CORS
app.use(express.json());
app.use(cors());

// Yêu cầu: Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Kết nối MongoDB Atlas thành công!'))
    .catch(err => {
        console.error('Lỗi kết nối cơ sở dữ liệu:', err);
        process.exit(1); // Dừng server nếu không kết nối được DB
    });

// ==========================================
// CÁC API THEO YÊU CẦU CÂU 3
// ==========================================

// Yêu cầu 8: Tạo endpoint GET /health để kiểm tra trạng thái
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend đang hoạt động bình thường' });
});

// Yêu cầu 1 (GET /api/foods và GET /api/foods?search=...): Lấy danh sách & Tìm kiếm
// Yêu cầu 2: Tìm kiếm theo tên, loại món hoặc vùng miền
app.get('/api/foods', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } }, // 'i' là không phân biệt hoa thường
                    { category: { $regex: search, $options: 'i' } },
                    { cuisine: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const foods = await Food.find(query);
        res.status(200).json(foods); // Yêu cầu 6: Trả về JSON và mã HTTP phù hợp
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ khi lấy danh sách món ăn', details: error.message });
    }
});

// Yêu cầu 1 (GET /api/foods/:id): Xem thông tin một món ăn
app.get('/api/foods/:id', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        // Yêu cầu 5: Xử lý không tìm thấy
        if (!food) {
            return res.status(404).json({ error: 'Không tìm thấy món ăn này' });
        }
        res.status(200).json(food);
    } catch (error) {
        res.status(400).json({ error: 'ID không hợp lệ hoặc lỗi máy chủ' });
    }
});

// Yêu cầu 1 (POST /api/foods): Thêm món ăn mới
// Yêu cầu 3 & 4: Kiểm tra dữ liệu đầu vào và không cho trùng foodId
app.post('/api/foods', async (req, res) => {
    try {
        const newFood = new Food(req.body);
        const savedFood = await newFood.save();
        res.status(201).json(savedFood);
    } catch (error) {
        // Xử lý lỗi trùng lặp foodId (Mã lỗi MongoDB là 11000)
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Mã món ăn (foodId) đã tồn tại trong hệ thống' });
        }
        // Yêu cầu 5: Xử lý dữ liệu không hợp lệ (Lỗi Validator của Mongoose)
        res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ', details: error.message });
    }
});

// Yêu cầu 1 (PUT /api/foods/:id): Cập nhật thông tin món ăn
app.put('/api/foods/:id', async (req, res) => {
    try {
        const updatedFood = await Food.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // runValidators đảm bảo Yêu cầu 3
        );
        
        if (!updatedFood) {
            return res.status(404).json({ error: 'Không tìm thấy món ăn để cập nhật' });
        }
        res.status(200).json(updatedFood);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Mã món ăn mới bị trùng lặp' });
        }
        res.status(400).json({ error: 'Dữ liệu cập nhật không hợp lệ', details: error.message });
    }
});

// Yêu cầu 1 (DELETE /api/foods/:id): Xóa món ăn
app.delete('/api/foods/:id', async (req, res) => {
    try {
        const deletedFood = await Food.findByIdAndDelete(req.params.id);
        if (!deletedFood) {
            return res.status(404).json({ error: 'Không tìm thấy món ăn để xóa' });
        }
        res.status(200).json({ message: 'Xóa món ăn thành công', deletedFood });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ khi xóa món ăn' });
    }
});

// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================
// Yêu cầu 7: Dùng biến môi trường để cấu hình cổng chạy
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Backend đang chạy tại cổng ${PORT}`);
});