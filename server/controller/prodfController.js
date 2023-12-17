const path = require('path');
//const e_prods = require('../model/prodfModel');
const fs = require('fs');
const csv = require('csv-parser');
const { name } = require('ejs');
const prods = require('../model/prodfModel');

exports.getpage = async(req,res) => {
res.sendFile(path.join(__dirname, '..', '..','prodf.html'));
};

exports.submitprod = async (req, res) => {
const {Item_code ,Item_name , category , unit } = req.body;
const projectId = req.session.projectId



try {
    const record = new prods({
        projectId : projectId,
        Item_code : Item_code,
        Item_name: Item_name,
        category: category,
        unit: unit,
    });
    await record.save();
    console.log('Record inserted successfully.');

    res.status(200).send("success");
} catch (error) {
    console.error('Error inserting record:', error);
    res.status(500).send('Error inserting record.');
}
};
    
    exports.handleFileUploads = (req, res) => {
    const file = req.file;

    console.log(file);

    const projectId = req.session.projectId
    
    if (!file) {
        return res.status(400).send('No file uploaded');
    }
    
    const resultss = [];
    
    // Parse CSV file
    fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (data) => resultss.push(data))
        .on('end', () => {
        // Remove the temporary file
        fs.unlinkSync(file.path);
    
        // Map data to MongoDB worker documents
        const workerss = resultss.map((resul) => ({
            projectId : projectId,
            Item_code : resul.Item_code,
            Item_name: resul.Item_name,
            category: resul.category,
            unit: resul.unit,
            }));
    
        // Save worker documents to MongoDB
        prods.insertMany(workerss)
            .then(() => {
            res.send('Data imported successfully');
            })
            .catch((error) => {
                console.error('Error importing data:', error);
            res.status(500).send('Error importing data');
            });
        });
    };