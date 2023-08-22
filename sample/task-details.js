    const express = require('express');
    const { MongoClient } = require('mongodb');
    const PORT = process.env.PORT || 3000;
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    const router = express.Router();



    const uri = 'mongodb+srv://jayran:O9UdszTUcb8j2KA7@cluster0.v6wdfkq.mongodb.net/Site_Activity?retryWrites=true&w=majority';
    const client = new MongoClient(uri);

    app.post('/submit-task', async (req, res) => {
    const { Taskname, Subtask, StartDate, EndDate } = req.body;

    try {
        await client.connect();
        const database = client.db('Site_Activity');
        const collection = database.collection('To_Do');

        const record = {
        Task_name: Taskname,
        Sub_Tasks: Subtask.map((subtask) => ({
            Sub_Task_name: subtask,
            Checklist: ''
        })),
        Start_date: StartDate,
        End_date: EndDate,
        Work_done: ''
        };

        const result = await collection.insertOne(record);
        console.log('Record inserted successfully.');

        res.status(200).send('Record inserted successfully.');
    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
    } finally {
        await client.close();
    }
    });

    app.listen(3000, () => {
    console.log(`Server started on http://localhost:${PORT}`);
    });
