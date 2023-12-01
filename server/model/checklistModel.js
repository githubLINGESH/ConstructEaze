const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
    projectId: String,
    files: [
        {
            data: Buffer,
            contentType: String,
            originalName: String,
        },
    ],
});

const Checklist = mongoose.model('Checklist', checklistSchema);

module.exports = Checklist;
