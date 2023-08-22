const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
id: Number,
Date_o:String,
Date_i:String,
Date_u:String,
Vendor_name: String,
Name_of_Material: String,
Required_quantity: Number,
Supplied_quantity: Number,
Unit_prize: Number,
Used: Number,
Current_stock: Number,
Price:Number
});

const e_products = mongoose.model('e_products', ProductSchema);

module.exports = e_products;
