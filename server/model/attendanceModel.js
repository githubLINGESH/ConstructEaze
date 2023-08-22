const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: String,
  male: Number,
  female: Number,
  total: Number,
  w_female: Number,
  w_male: Number,
});

const L_Attendance = mongoose.model('L_Attendance', attendanceSchema);

module.exports = L_Attendance;
