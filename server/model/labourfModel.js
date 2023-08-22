    const mongoose = require('mongoose');

    const labourSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        Category: {
            type: String,
            required: true,
        },
        wages_per_shift: {
            type: String,
            required: true,
        },

    });

    const E_labour = mongoose.model('E_labour', labourSchema);

    module.exports = E_labour;