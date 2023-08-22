    const mongoose = require('mongoose');

    const labourSchema = new mongoose.Schema({
    laborName: String,
    duty: String,
    gender: String,
    attendance: String,
    dates: Number,
    wages: Number,
    shift: Number
    });

    const L_AddLabour = mongoose.model('L_AddLabour', labourSchema);

    module.exports = L_AddLabour;
