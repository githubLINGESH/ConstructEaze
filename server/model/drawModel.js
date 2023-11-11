const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
    projectId : String,
    image: { data: Buffer, contentType: String },
});


const drawing = mongoose.model('drawing',checklistSchema);

module.exports = drawing;