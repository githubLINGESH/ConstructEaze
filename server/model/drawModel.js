const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
    projectId : String,
    fileName : String,
    files: [
        {
            data: Buffer,
            contentType: String,
            originalName: String,
        },
    ],
});


const drawing = mongoose.model('drawing',checklistSchema);

module.exports = drawing;