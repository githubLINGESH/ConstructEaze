    const s_todo = require('../model/todoModel');
    const path = require('path')

    exports.getTodoPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..','..', 'todo.html'));
    };

    exports.submitTask = async (req, res) => {
    const { Taskname, StartDate, EndDate } = req.body;

    try {
        const record = new s_todo({
        Task_name: Taskname,
        Start_date: StartDate,
        End_date: EndDate,
        Work_done: null,
        });

        await record.save();
        console.log('Record inserted successfully.');

        res.status(200).send('Record inserted successfully.');
    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
    }
    };

    exports.getTasks = async (req, res) => {
    try {
        const tasks = await s_todo.find();

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).send('Error retrieving tasks.');
    }
    };

    exports.searchTasks = async (req, res) => {
    const { Task_Name } = req.body;

    try {
        const tasks = await s_todo.find({ Task_name: Task_Name });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error searching tasks:', error);
        res.status(500).send('Error searching tasks.');
    }
    };
