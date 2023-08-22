const contracts = require('../model/contractModel');
const path = require('path');

exports.getpage = async (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'conts.html'));
};

exports.submitTask = async (req, res) => {
  const { w_name, phone, w_type, sal, shift, start, end } = req.body;

  try {
    console.log('Received data:', req.body);

    const record = new contracts({
      w_name: w_name,
      phone: phone,
      w_type: w_type,
      sal: sal,
      shift: shift,
      start: start,
      end: end,
      pa: null // You can change this to 'Present' or 'Absent' if you want to set a default value.
    });

    await record.save();
    console.log('Record inserted successfully.');
  } catch (error) {
    console.error('Error inserting record:', error);
    res.status(500).send('Error inserting record.');
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await contracts.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).send('Error retrieving tasks.');
  }
};

// Function to update the "pa" field when marking Present/Absent
exports.markAttendance = async (req, res) => {
  try {
    const { workerID, status } = req.body;

    // Find the contract in the database by worker name
    const contract = await contracts.findOne({ w_name: workerID });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Update the "pa" field with the given status
    contract.pa = status; // status should be 'Present' or 'Absent'
    await contract.save();

    return res.status(200).json({ message: 'Attendance marked successfully', contract });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
