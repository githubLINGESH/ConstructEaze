    const E_labour = require('../model/labourfModel');
    const path = require('path');
    const fs = require('fs');
    const csv = require('csv-parser');

    exports.getlabour = async(req,res) => {
    res.sendFile(path.join(__dirname, '..', '..','labourf.html'));
    };

    exports.submitlabour = async (req, res) => {
    const { name, phone, Category, wages_per_shift} = req.body;

    try {
        const record = new E_labour({
        name: name,
        phone: phone,
        Category: Category,
        wages_per_shift: wages_per_shift
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
                name: result.name,
                phone: parseInt(result.phone),
                Category: result.Category,
                wages_per_shift : parseInt(result.wages_per_shift)
                }));
        
                // Save worker documents to MongoDB
                E_labour.insertMany(workers)
                .then(() => {
                    res.send('Data imported successfully');
                })
                .catch((error) => {
                    res.status(500).send('Error importing data');
                });
            });
        };
