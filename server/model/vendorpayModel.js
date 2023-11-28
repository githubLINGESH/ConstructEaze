const mongoose = require('mongoose');

const vpaySchema = new mongoose.Schema({
    projectId:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    unit:{
        type:String,
        required:true,
    },
    unitPrice:{
        type:Number,
        required:true,
    },
    Amount:{
        type:Number,
        required:true,
    },
});

const vpay = mongoose.model('payven', vpaySchema);

module.exports = vpay;