const L_Attendance = require('../model/attendanceModel');
const path = require('path');

// GET home page
exports.getAttendancePage = (req, res) => {
  res.sendFile(path.join(__dirname, '..','..','Attentdance.html'));
};

// POST new attendance record
exports.submitAttendance = async (req, res) => {
  const { date, male, female, total, w_female, w_male } = req.body;

  try {
    const record = new L_Attendance({
      date: date,
      male: male,
      female: female,
      total: total,
      w_female: w_female,
      w_male: w_male,
    });

    await record.save();
    console.log('Record inserted successfully.');

    res.status(200).send('Record inserted successfully.');
  } catch (error) {
    console.error('Error inserting record:', error);
    res.status(500).send('Error inserting record.');
  }
};

// GET all attendance records
exports.getAllAttendance = async (req, res) => {
  try {
    const tasks = await L_Attendance.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).send('Error retrieving tasks.');
  }
};
