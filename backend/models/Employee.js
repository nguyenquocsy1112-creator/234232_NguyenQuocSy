const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { 
    type: String, 
    required: [true, 'Mã nhân viên là bắt buộc'], 
    unique: true,
    trim: true 
  },
  fullName: { 
    type: String, 
    required: [true, 'Họ và tên là bắt buộc'],
    trim: true 
  },
  gender: { type: String, default: 'Nam' },
  dateOfBirth: { type: String, default: '' },
  department: { type: String, default: '' },
  position: { type: String, default: '' },
  email: { 
    type: String, 
    required: [true, 'Email là bắt buộc'],
    trim: true 
  },
  phone: { type: String, default: '' },
  hireDate: { type: String, default: '' },
  status: { type: String, default: 'Đang làm việc' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
