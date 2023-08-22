    const mongoose = require('mongoose');

    const materialSchema = new mongoose.Schema({
    Vendor_name: String,
    Name_of_Material: String,
    Required_quantity: Number,
    Supplied_quantity: Number,
    Unit_prize: Number,
    Date_o: String,
    Current_stock: Number,
    Pay_expenses: Number,
    });

    const s_materials = mongoose.model('s_materials', materialSchema);

    module.exports = s_materials;
