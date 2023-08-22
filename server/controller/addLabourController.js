    const path = require('path');
    const L_AddLabour = require('../model/labourModel');

    exports.getAddLabourPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'Add-labour.html'));
    };

    exports.getTasks = async (req, res) => {
    try {
        const tasks = await L_AddLabour.find();
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error retrieving tasks:', error);
         res.status(500).send('Error retrieving tasks.');
    }
    };

    exports.submitLabour = async (req, res) => {
    const { laborName, duty, gender, attendance, dates, wages, shift } = req.body;

    try {
        const record = new L_AddLabour({
        laborName: laborName,
        duty: duty,
        gender: gender,
        attendance: attendance,
        dates: parseInt(dates),
        wages: parseInt(wages),
        shift: parseInt(shift)
        });

        await record.save();
        console.log('Record inserted successfully.');

        res.status(200).send('Record inserted successfully.');
    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
    }
    };
