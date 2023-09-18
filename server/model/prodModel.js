const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
userId:Number,
role:String,
id: Number,
order: Boolean,
Date_o:String,
Date_i:String,
Date_u:String,
flag : Boolean,
Vendor_name: String,
Firmname: String,
Address: String,
Gst: Number,
Phone: Number,
Item_code: Number,
Name_of_Material: String,
Category: String,
Unit: String,
Unit_prize: Number,
Required_quantity: Number,
Supplied_quantity: Number,
Used: Number,
Current_stock: Number,
Price:Number
});


const e_products = mongoose.model('e_products', ProductSchema);

module.exports = e_products;