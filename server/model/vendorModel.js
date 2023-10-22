    const mongoose = require('mongoose');

    const vendorSchema = new mongoose.Schema({
        projectId:{
            type:String,
            required:true,
        },
        name: {
            type: String,
            required: true,
        },
        firm_name:{
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        Gst: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
    });

    const E_vendor = mongoose.model('E_vendor', vendorSchema);

    module.exports = E_vendor;
    