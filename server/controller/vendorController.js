    const E_vendor = require('../model/vendorModel');
    const path = require('path');
    const fs = require('fs');
    const csv = require('csv-parser');

    exports.getvendor = async(req,res) => {
    res.sendFile(path.join(__dirname, '..', '..','vendorf.html'));
    };

    exports.submitvendor = async (req, res) => {
    const { name, firm_name, address,Gst,phone} = req.body;

    try {
        const record = new E_vendor({
        name: name,
        firm_name:firm_name,
        address: address,
        Gst:Gst,
        phone: phone,
        });

        await record.save();
        console.log('Record inserted successfully.');

        res.status(200).send('Record inserted successfully.');
    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
    }
    };
    
        exports.handleFileUpl = (req, res) => {
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
                firm_name : result.firm_name,
                address: result.address,
                Gst : parseInt(result.Gst),
                phone: parseInt(result.phone)
                }));
        
                // Save worker documents to MongoDB
                E_vendor.insertMany(workers)
                .then(() => {
                    res.send('Data imported successfully');
                })
                .catch((error) => {
                    res.status(500).send('Error importing data');
                });
            });
        };
        