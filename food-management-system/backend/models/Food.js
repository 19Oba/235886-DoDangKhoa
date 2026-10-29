const mongoose = require('mongoose');

// Định nghĩa Schema (cấu trúc) cho món ăn theo yêu cầu Câu 2.3
const foodSchema = new mongoose.Schema({
    foodId: { 
        type: String, 
        required: [true, 'Vui lòng nhập mã món ăn'], 
        unique: true, // Yêu cầu: Không cho phép trùng mã món ăn
        trim: true 
    },
    name: { 
        type: String, 
        required: [true, 'Vui lòng nhập tên món ăn'] 
    },
    category: { type: String, trim: true },
    cuisine: { type: String, trim: true },
    ingredients: { type: [String], default: [] },
    price: { 
        type: Number, 
        required: [true, 'Vui lòng nhập giá bán'],
        min: [0, 'Giá bán không được âm']
    },
    quantity: { 
        type: Number, 
        default: 0,
        min: [0, 'Số lượng không được âm']
    },
    description: { type: String },
    imageUrl: { type: String }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Food', foodSchema);