const mongoose = require('mongoose');

const SuperAttSchema = new mongoose.Schema({

    superId:{
        type:String,
        required:true
    },

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
    },
    latitude:{
        type:Number,
        required:true
    },
    longitude:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    login_t:{
        type:Date,
        required:true
    },
    logout_t:{
        type:Date
        
    }

});

const s_att = mongoose.model('s_att',SuperAttSchema)

module.exports = s_att;
