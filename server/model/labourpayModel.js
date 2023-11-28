const mongoose = require('mongoose');

const lpaySchema = new mongoose.Schema({
    projectId:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    Amount:{
        type:Number,
        required:true,
    }
});

const lpay = mongoose.model('paylab', lpaySchema);

module.exports = lpay;