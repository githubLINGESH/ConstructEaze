const express = require('express');
const { MongoClient } = require('mongodb');
const PORT = process.env.PORT || 5501;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const path = require('path');
const router = express.Router();



const uri = 'mongodb+srv://jayran:' + encodeURIComponent('O9UdszTUcb8j2KA7') + '@cluster0.v6wdfkq.mongodb.net/Site_Activity?retryWrites=true&w=majority';
const client = new MongoClient(uri);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'TO-DO.html'));
});

    app.post('/submit-task', async (req, res) => {
        const { Taskname, Subtask, StartDate, EndDate } = req.body;
    
        try {
        await client.connect();
        console.log('Connected to the database'); // Add this line
    
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
    
app.get('/tasks', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('Site_Activity');
        const collection = database.collection('To_Do');

        // Retrieve all tasks from the collection
        const tasks = await collection.find().toArray();

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).send('Error retrieving tasks.');
    }

    finally {
            if (client && client.topology && client.topology.isConnected()) {
            await client.close();
            }
        }}
    
);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
