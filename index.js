const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const PORT = process.env.PORT || 3000;
const dbName = 'Site_Activity';
const collectionName = 'Material';
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const path = require('path');
const router = express.Router();

const uri = 'mongodb+srv://jayran:' + encodeURIComponent('O9UdszTUcb8j2KA7') + '@cluster0.v6wdfkq.mongodb.net/Site_Activity?retryWrites=true&w=majority';
const client = new MongoClient(uri);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/punda', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = router;

    app.post('/submit-task', async (req, res) => {
        const { Vendor_name, Name_of_Material, Required_quantity, Supplied_quantity , Unit_prize , Date , Current_stock,Pay_expenses } = req.body;
    
        try {
        await client.connect();
        console.log('Connected to the database'); // Add this line
    
        const database = client.db('Site_Activity');
        const collection = database.collection('Material');
    
        const record = {
            Vendor_name: Vendor_name,
            Name_of_Material: Name_of_Material,
            Required_quantity: Required_quantity,
            Supplied_quantity: Supplied_quantity,
            Unit_prize: Unit_prize,
            Date: Date,
            Current_stock: Current_stock,
            Pay_expenses: Pay_expenses
            
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
    
app.get('/retrieve-documents', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('Site_Activity');
        const collection = database.collection('Material');

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
