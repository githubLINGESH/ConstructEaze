    const s_todo = require('../model/todoModel');
    const path = require('path')

    exports.getTodoPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..','..', 'todo.html'));
    };

    exports.submitTask = async (req, res) => {
    const { Taskname, StartDate, EndDate } = req.body;
    const userId = req.session.auth;
    const role = req.session.role;

    try {
        const record = new s_todo({
        userId:userId,
        role:role,
        Task_name: Taskname,
        Start_date: StartDate,
        End_date: EndDate,
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
        const userId = req.session.auth;
        const role = req.session.role;
    try {
        const tasks = await s_todo.find({userId:userId, role:role});

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).send('Error retrieving tasks.');
    }
    };

    exports.autosearch = async (req, res) => {
        const query = req.query.term.toLowerCase();
        
        try {
            const suggestions = await s_todo.find({ Task_name: { $regex: query, $options: 'i' } })
                .select('Task_name') // Select only the Task_name field
                .limit(10); // Limit the number of suggestions to 10
            
            const suggestionList = suggestions.map(task => task.Task_name);
            res.json(suggestionList);
        } catch (error) {
            console.error('Error fetching autocomplete suggestions:', error);
            res.status(500).send('Error fetching autocomplete suggestions.');
        }
    };

