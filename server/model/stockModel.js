    const mongoose = require('mongoose');

    // Define the schema for the e_stock collection
    const eStockSchema = new mongoose.Schema({
    nameOfMaterial: {
        type: String,
        required: true,
        unique: true,
    },
    totalSuppliedQuantity: {
        type: Number,
        default: 0, // You can set a default value if needed
    },
    currentStock:{
        type:Number
    },
    used:{
        type:Number,
    }
    });

    // Create the Mongoose model for the e_stock collection
    const e_stock = mongoose.model('e_stock', eStockSchema);

    module.exports = e_stock;