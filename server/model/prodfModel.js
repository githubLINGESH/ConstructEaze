    const mongoose = require('mongoose');

    const prodSchema = new mongoose.Schema({
        projectId:{
            type:String,
            required:true
        },
        Item_code: {
            type: String,
            required: true,
        },
        Item_name: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        unit: {
            type: String,
            required: true,
        },

    });

    const prods = mongoose.model('products', prodSchema);

    module.exports = prods;