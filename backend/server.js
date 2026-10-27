const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Employee = require('./models/Employee');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas bằng biến môi trường
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('LỖI: Chưa cấu hình MONGODB_URI trong file .env');
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('>>> MongoDB Atlas Connected Successfully!'))
  .catch(err => console.error('>>> MongoDB Connection Error:', err));

// Endpoint kiểm tra trạng thái: GET /health
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend service is running fine' });
});

// Endpoint lấy danh sách + Tìm kiếm (theo employeeId hoặc fullName): GET /api/employees?search=...
app.get('/api/employees', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { employeeId: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const employees = await Employee.find(query);
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Endpoint lấy thông tin 1 nhân viên: GET /api/employees/:id
app.get('/api/employees/:id', async (req, res) => {
  try {
    const param = req.params.id;
    let employee;

    if (mongoose.Types.ObjectId.isValid(param)) {
      employee = await Employee.findById(param);
    }
    
    if (!employee) {
      employee = await Employee.findOne({ employeeId: param });
    }

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Endpoint thêm nhân viên mới: POST /api/employees
app.post('/api/employees', async (req, res) => {
  try {
    const { employeeId, fullName, email } = req.body;

    // Validation đầu vào tối thiểu
    if (!employeeId || !fullName || !email) {
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ. Vui lòng cung cấp đầy đủ employeeId, fullName và email.' 
      });
    }

    // Bảo đảm mã nhân viên không trùng lặp
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Mã nhân viên đã tồn tại trên hệ thống' });
    }

    const newEmployee = new Employee(req.body);
    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi tạo nhân viên', error: err.message });
  }
});

// Endpoint cập nhật thông tin nhân viên: PUT /api/employees/:id
app.put('/api/employees/:id', async (req, res) => {
  try {
    const param = req.params.id;
    let updatedEmployee;

    if (mongoose.Types.ObjectId.isValid(param)) {
      updatedEmployee = await Employee.findByIdAndUpdate(param, req.body, { new: true, runValidators: true });
    }

    if (!updatedEmployee) {
      updatedEmployee = await Employee.findOneAndUpdate({ employeeId: param }, req.body, { new: true, runValidators: true });
    }

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên để cập nhật' });
    }

    res.status(200).json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi cập nhật nhân viên', error: err.message });
  }
});

// Endpoint xóa nhân viên: DELETE /api/employees/:id
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const param = req.params.id;
    let deletedEmployee;

    if (mongoose.Types.ObjectId.isValid(param)) {
      deletedEmployee = await Employee.findByIdAndDelete(param);
    }

    if (!deletedEmployee) {
      deletedEmployee = await Employee.findOneAndDelete({ employeeId: param });
    }

    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên để xóa' });
    }

    res.status(200).json({ message: 'Đã xóa nhân viên thành công', deletedEmployee });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa nhân viên', error: err.message });
  }
});

// Cấu hình cổng chạy bằng biến môi trường PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`>>> Server Backend đang chạy tại cổng ${PORT}`);
});
