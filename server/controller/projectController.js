const path = require('path');
    const e_projects = require('../model/projectModel');
    

    exports.getpag = async(req,res) => {
    res.sendFile(path.join(__dirname, '..', '..','addproj.html'));
    };

    exports.submitproj = async (req, res) => {
    const { Project_name,Address,City} = req.body;

    try {
        const record = new e_projects({
            Project_name : Project_name ,
            Address: Address,
            City  : City,
        });

        const savedRecord = await record.save();
    console.log('Record inserted successfully.');

    res.status(200).json(savedRecord);
    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
    }
    };