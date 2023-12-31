    const e_products = require('../model/prodModel');
    const path = require('path');
    const fs = require('fs');
    const csv = require('csv-parser');

    exports.getvendor = async(req,res) => {
    res.sendFile(path.join(__dirname, '..', '..','vendorf.html'));
    };

    exports.submitvendor = async (req, res) => {
    const { name, firm_name, address,Gst,phone} = req.body;
    const projectId = req.session.projectId;
    try{
            const record = new e_products({
                purchaseOrderNo: null,
                vendor: {
                projectId:projectId,
                vendorName: name,
                firmName: firm_name,
                address: address,
                gst: Gst,
                phone: phone,
                },
                products: null,
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
            const projectId = req.session.projectId;
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
                    purchaseOrderNo: null,
                    vendor: {
                    projectId:projectId,
                    vendorName: result.name,
                    firmName: result.firm_name,
                    address: result.address,
                    gst: result.Gst,
                    phone: result.phone,
                    },
                    products: null,
                }));
        
                // Save worker documents to MongoDB
                e_products.insertMany(workers)
                .then(() => {
                    res.send('Data imported successfully');
                })
                .catch((error) => {
                    res.status(500).send('Error importing data');
                });
            });
        };
        