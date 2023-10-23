const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
    projectId : String,
    image: { data: Buffer, contentType: String },
});


const checklist = mongoose.model('checklist',checklistSchema);

module.exports = checklist;