const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
Project_name: String,
Address: String,
City: String,

});

const e_projects = mongoose.model('e_projects', ProjectSchema);

module.exports = e_projects;
