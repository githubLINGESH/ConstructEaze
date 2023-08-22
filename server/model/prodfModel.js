    const mongoose = require('mongoose');

    const prodSchema = new mongoose.Schema({
        Item_code: {
            type: Number,
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
        description: {
            type: String,
            required: true,
        },
        unit: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },

    });

    const e_prods = mongoose.model('e_prods', prodSchema);

    module.exports = e_prods;