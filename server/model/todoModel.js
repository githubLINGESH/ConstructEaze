    const mongoose = require('mongoose');


    const toDoSchema = new mongoose.Schema({
    projectId : String,
    userId:Number,
    Task_name: String,
    Start_date: String,
    End_date: String,
    Work_done: String,
    });

    const s_todo = mongoose.model('s_todo', toDoSchema);

    module.exports = s_todo;
