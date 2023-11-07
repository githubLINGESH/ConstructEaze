    const mongoose = require('mongoose');

    const ProductSchema = new mongoose.Schema({
    slNo:Number,
    itemCode: Number,
    nameOfMaterial: String,
    category: String,
    unit: String,
    unitPrice: Number,
    requiredQuantity: Number,
    suppliedQuantity: Number,
    currentStock: Number,
    price: Number,
    order:Boolean,
    ReturnQuantity:Number,
    total:Number,
    gst:Number,
    grandTotal:Number,
    });

    const VendorSchema = new mongoose.Schema({
    projectId:String,
    vendorName: String,
    firmName: String,
    address: String,
    gst: String,
    phone: String,
    site: String,
    });

    const PurchaseOrderSchema = new mongoose.Schema({
    date:Date,
    projectId:String,
    purchaseOrderNo: String,
    vendor: VendorSchema,
    products: [ProductSchema],
    });

    const e_products = mongoose.model('e_prod', PurchaseOrderSchema);

    module.exports = e_products;
