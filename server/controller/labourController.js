    const contracts = require('../model/contractModel');
    const path = require('path');
    const fs = require('fs');
    const csv = require('csv-parser');

    exports.getlabour = async(req,res) => {
    res.sendFile(path.join(__dirname, '..', '..','labourf.html'));
    };

    exports.submitlabour = async (req, res) => {
    const { name, phone, w_type, salary} = req.body;
    const userId = req.session.userId;
    const role = req.session.role;
    const projectId = req.session.projectId;

    try {
        const record = new contracts({
        projectId:projectId,
        userId:userId,
        role:role,
        w_name: name,
        phone: phone,
        w_type: w_type,
        sal: salary,
        shift:0,
        });

        await record.save();
        console.log('Record inserted successfully.');

        res.status(200).send('Record inserted successfully.');
    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
    }
    };

        exports.handleFileUploadlab = (req, res) => {
            const file = req.file;
            const userId = req.session.userId;
            const role = req.session.role;
            const projectId = req.session.projectId;
        
            if (!file) {
            return res.status(400).send('No file uploaded');
            }
        
            const results = [];
        
            // Parse CSV file
            fs.createReadStream(file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                // Remove the temporary file
                fs.unlinkSync(file.path);
        
                // Map data to MongoDB worker documents
                const workers = results.map((result) => ({
                userId:userId,
                role:role,
                projectId:projectId,
                name: result.name,
                phone: parseInt(result.phone),
                Category: result.Category,
                wages_per_shift : parseInt(result.wages_per_shift)
                }));
        
                // Save worker documents to MongoDB
                contracts.insertMany(workers)
                .then(() => {
                    res.send('Data imported successfully');
                })
                .catch((error) => {
                    res.status(500).send('Error importing data');
                });
            });
        };
