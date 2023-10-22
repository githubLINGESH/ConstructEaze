const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  projectId:{
    type:String,
  },
  userId:{
    type:Number
  },
  role:{
    type:String,
    required:true,
  },
  date:{
    type:Date,
    default:null,
  },
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
    required: false,
  },
  pa: {
    type: String,
    default:null
  },
  latitude:{
    type:Number,
    default:null,
  },
  longitude:{
    type:Number,
    default:null,
  },
  total:{
    type:Number,
    default:null,
  },
  name:{
    type:String
  }
});

const contracts = mongoose.model('contracts', contractSchema);

module.exports = contracts;
