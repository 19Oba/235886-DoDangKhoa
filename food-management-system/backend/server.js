const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Cấu hình CORS cực kỳ thoáng
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Thêm OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. Chuỗi kết nối MongoDB Atlas đã thêm tên database
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://khoad6811_db_user:khoa1234@235886dodangkhoa.jkxzahk.mongodb.net/235886_DoDangKhoa?retryWrites=true&w=majority&appName=235886DoDangKhoa";

mongoose.connect(MONGO_URI)
    .then(() => console.log('Kết nối MongoDB Atlas thành công!'))
    .catch(err => {
        console.error('CHI TIẾT LỖI MONGODB:', err.message);
    });

// Định nghĩa Schema
const foodSchema = new mongoose.Schema({
    foodId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    category: { type: String, trim: true },
    cuisine: { type: String, trim: true },
    ingredients: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    description: { type: String },
    imageUrl: { type: String }
}, { timestamps: true, collection: 'foods' });

const Food = mongoose.model('Food', foodSchema);

// ================= API =================
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend đang hoạt động bình thường' });
});

app.get('/api/foods', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { cuisine: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const foods = await Food.find(query);
        res.status(200).json(foods);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ khi lấy danh sách món ăn', details: error.message });
    }
});

app.get('/api/foods/:id', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) return res.status(404).json({ error: 'Không tìm thấy món ăn này' });
        res.status(200).json(food);
    } catch (error) {
        res.status(400).json({ error: 'ID không hợp lệ hoặc lỗi máy chủ' });
    }
});

app.post('/api/foods', async (req, res) => {
    try {
        const newFood = new Food(req.body);
        const savedFood = await newFood.save();
        res.status(201).json(savedFood);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ error: 'Mã món ăn (foodId) đã tồn tại' });
        res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ', details: error.message });
    }
});

app.put('/api/foods/:id', async (req, res) => {
    try {
        const updatedFood = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedFood) return res.status(404).json({ error: 'Không tìm thấy món ăn để cập nhật' });
        res.status(200).json(updatedFood);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ error: 'Mã món ăn bị trùng lặp' });
        res.status(400).json({ error: 'Dữ liệu cập nhật không hợp lệ', details: error.message });
    }
});

app.delete('/api/foods/:id', async (req, res) => {
    try {
        const deletedFood = await Food.findByIdAndDelete(req.params.id);
        if (!deletedFood) return res.status(404).json({ error: 'Không tìm thấy món ăn để xóa' });
        res.status(200).json({ message: 'Xóa món ăn thành công', deletedFood });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ khi xóa món ăn' });
    }
});

// Thêm route gốc để test server
app.get('/', (req, res) => {
    res.send('Server Backend đang hoạt động rất tốt!');
});

const PORT = process.env.PORT || 5005; // Đổi sang 5005
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Backend đang chạy tại cổng ${PORT}`);
});