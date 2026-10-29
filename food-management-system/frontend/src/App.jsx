import { useState, useEffect } from 'react';
import axios from 'axios';

// Yêu cầu 8: Đọc URL backend từ biến môi trường
const API_URL = 'https://grim-skeleton-pj6pg6gjj6qjfw45-5005.app.github.dev/api';

function App() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  
  // Yêu cầu 7: State quản lý trạng thái tải và thông báo
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Quản lý màn hình đang hiển thị: 'list', 'add', 'edit', 'detail'
  const [view, setView] = useState('list'); 
  const [selectedFood, setSelectedFood] = useState(null);

  // Form State
  const initialForm = { foodId: '', name: '', category: '', cuisine: '', price: '', quantity: '', description: '', imageUrl: '' };
  const [formData, setFormData] = useState(initialForm);

  // ==========================================
  // CÁC HÀM XỬ LÝ (Yêu cầu 1-6)
  // ==========================================

  // Yêu cầu 1 & 6: Lấy danh sách & Tìm kiếm
  const fetchFoods = async (searchQuery = '') => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.get(`${API_URL}/foods?search=${searchQuery}`);
      setFoods(res.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi tải danh sách món ăn!' });
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải danh sách khi mở trang
  useEffect(() => {
    fetchFoods();
  }, []);

  // Yêu cầu 5: Xóa món ăn
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa món này?')) return;
    try {
      await axios.delete(`${API_URL}/foods/${id}`);
      setMessage({ type: 'success', text: 'Xóa món ăn thành công!' });
      fetchFoods(search); // Tải lại danh sách
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi xóa món ăn!' });
    }
  };

  // Yêu cầu 2: Xem chi tiết món ăn
  const handleViewDetail = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/foods/${id}`);
      setSelectedFood(res.data);
      setView('detail');
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể tải chi tiết món ăn!' });
    } finally {
      setLoading(false);
    }
  };

  // Điều hướng mở Form
  const handleOpenAdd = () => {
    setFormData(initialForm);
    setView('add');
  };

  const handleOpenEdit = (food) => {
    setFormData(food);
    setView('edit');
  };

  // Lắng nghe thay đổi input trong Form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Yêu cầu 3 & 4: Xử lý submit thêm mới / cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (view === 'add') {
        await axios.post(`${API_URL}/foods`, formData);
        setMessage({ type: 'success', text: 'Thêm món ăn thành công!' });
      } else if (view === 'edit') {
        await axios.put(`${API_URL}/foods/${formData._id}`, formData);
        setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      }
      setView('list');
      fetchFoods();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Có lỗi xảy ra!' });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GIAO DIỆN CHÍNH
  // ==========================================
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Quản Lý Món Ăn - {import.meta.env.VITE_API_URL ? "Môi trường Cloud" : "Môi trường Local"}</h1>
      
      {/* Yêu cầu 7: Hiển thị thông báo thành công / lỗi */}
      {message.text && (
        <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: message.type === 'error' ? '#ffe6e6' : '#e6ffe6', color: message.type === 'error' ? 'red' : 'green', border: '1px solid', borderRadius: '4px' }}>
          {message.text}
        </div>
      )}
      
      {/* Yêu cầu 7: Hiển thị trạng thái tải */}
      {loading && <p style={{ color: 'blue', fontStyle: 'italic' }}>Đang tải dữ liệu...</p>}

      {/* ---------------- MÀN HÌNH DANH SÁCH ---------------- */}
      {view === 'list' && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="Nhập tên, vùng miền để tìm kiếm..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              style={{ flex: 1, padding: '8px' }}
            />
            <button onClick={() => fetchFoods(search)} style={{ padding: '8px 15px' }}>Tìm Kiếm</button>
            <button onClick={handleOpenAdd} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>+ Thêm Món Mới</button>
          </div>

          <table border="1" width="100%" cellPadding="10" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4' }}>
                <th>Mã</th><th>Tên món</th><th>Loại</th><th>Giá (VNĐ)</th><th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {foods.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>Không có dữ liệu món ăn</td></tr>
              ) : (
                foods.map(food => (
                  <tr key={food._id}>
                    <td>{food.foodId}</td>
                    <td>{food.name}</td>
                    <td>{food.category}</td>
                    <td>{food.price.toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleViewDetail(food._id)}>Xem</button>
                      <button onClick={() => handleOpenEdit(food)} style={{ margin: '0 5px' }}>Sửa</button>
                      <button onClick={() => handleDelete(food._id)} style={{ color: 'red' }}>Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {/* ---------------- MÀN HÌNH CHI TIẾT ---------------- */}
      {view === 'detail' && selectedFood && (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '5px' }}>
          <h2>Chi Tiết: {selectedFood.name}</h2>
          <p><strong>Mã món:</strong> {selectedFood.foodId}</p>
          <p><strong>Loại món ăn:</strong> {selectedFood.category || 'N/A'}</p>
          <p><strong>Vùng miền:</strong> {selectedFood.cuisine || 'N/A'}</p>
          <p><strong>Giá bán:</strong> {selectedFood.price.toLocaleString()} VNĐ</p>
          <p><strong>Số lượng hiện có:</strong> {selectedFood.quantity}</p>
          <p><strong>Mô tả:</strong> {selectedFood.description || 'N/A'}</p>
          <button onClick={() => setView('list')} style={{ padding: '8px 15px', marginTop: '10px' }}>Quay Lại Danh Sách</button>
        </div>
      )}

      {/* ---------------- MÀN HÌNH FORM (THÊM / SỬA) ---------------- */}
      {(view === 'add' || view === 'edit') && (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '5px' }}>
          <h2>{view === 'add' ? 'Thêm Món Ăn Mới' : 'Cập Nhật Thông Tin Món Ăn'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <input name="foodId" placeholder="Mã món (VD: F04) - Không được trùng" value={formData.foodId} onChange={handleChange} required disabled={view === 'edit'} style={{ padding: '8px' }} />
            
            <input name="name" placeholder="Tên món ăn (Bắt buộc)" value={formData.name} onChange={handleChange} required style={{ padding: '8px' }} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input name="category" placeholder="Loại món ăn (VD: Món nước)" value={formData.category || ''} onChange={handleChange} style={{ padding: '8px', flex: 1 }} />
              <input name="cuisine" placeholder="Vùng miền (VD: Miền Nam)" value={formData.cuisine || ''} onChange={handleChange} style={{ padding: '8px', flex: 1 }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input name="price" type="number" placeholder="Giá bán (Bắt buộc)" value={formData.price} onChange={handleChange} required style={{ padding: '8px', flex: 1 }} />
              <input name="quantity" type="number" placeholder="Số lượng" value={formData.quantity} onChange={handleChange} style={{ padding: '8px', flex: 1 }} />
            </div>

            <textarea name="description" placeholder="Mô tả món ăn" value={formData.description || ''} onChange={handleChange} style={{ padding: '8px', minHeight: '80px' }}></textarea>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {view === 'add' ? 'Lưu Món Mới' : 'Lưu Thay Đổi'}
              </button>
              <button type="button" onClick={() => setView('list')} style={{ padding: '10px 20px', cursor: 'pointer' }}>Hủy Bỏ</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;