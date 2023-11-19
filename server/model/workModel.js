const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
    projectId:{
        type:String,
        required:true,
    },
    workdone:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        required:true,
    }
});

const workdone = mongoose.model('workdone', workSchema);

module.exports = workdone;