const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    projectId:{
      type:String,
    },
    userId:{
      type:Number
    },
    role:{
      type:String
    },
    name: {
        type: String,
        required: true,
      },
      phone: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },

});

const E_client = mongoose.model('E_client', clientSchema);

module.exports = E_client;