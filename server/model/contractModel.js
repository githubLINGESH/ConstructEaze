const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  w_name: {
    type: String, // Name of the Worker should be a string
    required: true,
  },
  phone: {
    type: Number, // Phone Number should be a number
    required: true,
  },
  w_type: {
    type: String, // Worker Type should be a string
    required: true,
  },
  sal: {
    type: Number, // Salary Per Shift should be a number
    required: true,
  },
  shift: {
    type: Number, // Hours Per Shift should be a number
    required: true,
  },
  start: {
    type: Date, // Start Date should be a date
    required: true,
  },
  end: {
    type: Date, // End Date should be a date
    required: true,
  },
  pa: {
    type: String,
    default:null
  }
});

const contracts = mongoose.model('contracts', contractSchema);

module.exports = contracts;
