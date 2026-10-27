import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit, Trash2, RefreshCw, UserCheck } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-234232.onrender.com/api';

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const initialFormState = {
    employeeId: '',
    fullName: '',
    gender: 'Nam',
    dateOfBirth: '',
    department: '',
    position: '',
    email: '',
    phone: '',
    hireDate: '',
    status: 'Đang làm việc'
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchEmployees = async (keyword = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/employees`, {
        params: { search: keyword }
      });
      setEmployees(res.data);
    } catch (err) {
      showMessage('danger', 'Không thể kết nối đến máy chủ Backend!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(search);
  };

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleOpenEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData(employee);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.fullName || !formData.email) {
      showMessage('danger', 'Vui lòng điền đầy đủ Mã NV, Họ tên và Email!');
      return;
    }

    try {
      if (editingEmployee) {
        await axios.put(`${API_BASE_URL}/employees/${editingEmployee._id || editingEmployee.employeeId}`, formData);
        showMessage('success', 'Cập nhật thông tin nhân viên thành công!');
      } else {
        await axios.post(`${API_BASE_URL}/employees`, formData);
        showMessage('success', 'Thêm nhân viên mới thành công!');
      }
      setShowModal(false);
      fetchEmployees(search);
    } catch (err) {
      showMessage('danger', err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu!');
    }
  };

  const handleDelete = async (emp) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${emp.fullName}" (${emp.employeeId}) không?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/employees/${emp._id || emp.employeeId}`);
        showMessage('success', 'Đã xóa nhân viên thành công!');
        fetchEmployees(search);
      } catch (err) {
        showMessage('danger', err.response?.data?.message || 'Lỗi khi xóa nhân viên!');
      }
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2><UserCheck style={{ marginRight: 8 }} /> HỆ THỐNG QUẢN LÝ NHÂN SỰ</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>MSSV: 234232 - Nguyễn Quốc Sỹ</p>
      </header>

      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
          {message.text}
        </div>
      )}

      <div style={styles.toolbar}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã NV hoặc họ tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.btnPrimary}>
            <Search size={16} /> Tìm kiếm
          </button>
          <button type="button" onClick={() => { setSearch(''); fetchEmployees(''); }} style={styles.btnSecondary}>
            <RefreshCw size={16} /> Tải lại
          </button>
        </form>

        <button onClick={handleOpenAddModal} style={styles.btnSuccess}>
          <Plus size={16} /> Thêm nhân viên
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Đang tải dữ liệu...</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th>Mã NV</th>
                <th>Họ và Tên</th>
                <th>Giới tính</th>
                <th>Phòng ban</th>
                <th>Chức vụ</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: 20 }}>Không tìm thấy nhân viên nào.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id || emp.employeeId} style={styles.tr}>
                    <td><strong>{emp.employeeId}</strong></td>
                    <td>{emp.fullName}</td>
                    <td>{emp.gender}</td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: emp.status === 'Đang làm việc' ? '#28a745' : '#dc3545'
                      }}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleOpenEditModal(emp)} style={styles.btnEdit} title="Sửa">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(emp)} style={styles.btnDelete} title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>{editingEmployee ? 'Cập nhật thông tin nhân viên' : 'Thêm nhân viên mới'}</h3>
            <form onSubmit={handleSubmit} style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label>Mã nhân viên (*):</label>
                <input
                  type="text"
                  required
                  disabled={!!editingEmployee}
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Họ và Tên (*):</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Giới tính:</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  style={styles.input}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label>Ngày sinh:</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Phòng ban:</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Chức vụ:</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Email (*):</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Số điện thoại:</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Trạng thái:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={styles.input}
                >
                  <option value="Đang làm việc">Đang làm việc</option>
                  <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                  <option value="Tạm nghỉ">Tạm nghỉ</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 15 }}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.btnSecondary}>Hủy</button>
                <button type="submit" style={styles.btnPrimary}>Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  header: { backgroundColor: '#1e293b', color: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' },
  toolbar: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '10px' },
  searchInput: { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 },
  btnPrimary: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  btnSecondary: { backgroundColor: '#64748b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  btnSuccess: { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  btnEdit: { backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' },
  btnDelete: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  thRow: { backgroundColor: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #cbd5e1' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  badge: { color: '#fff', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' },
  alert: { padding: '12px', borderRadius: '4px', marginBottom: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '500px', maxWidth: '90%' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }
};

export default App;
