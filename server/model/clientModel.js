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

      },
      phone: {
        type: Number,

      },
      address: {
        type: String,
      },

});

const E_client = mongoose.model('E_client', clientSchema);

module.exports = E_client;