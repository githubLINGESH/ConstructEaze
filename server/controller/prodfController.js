const path = require('path');
const e_prods = require('../model/prodfModel');
const fs = require('fs');
const csv = require('csv-parser');

exports.getpage = async(req,res) => {
res.sendFile(path.join(__dirname, '..', '..','prodf.html'));
};

exports.submitprod = async (req, res) => {
const { Item_code ,Item_name , category , description, unit , price} = req.body;

try {
    const record = new e_prods({
        Item_code : Item_code,
        Item_name : Item_name,
        category  : category,
        description: description,
        unit :unit,
        price : price,
    });

    await record.save();
    console.log('Record inserted successfully.');

    res.status(200).send('Record inserted successfully.');
} catch (error) {
    console.error('Error inserting record:', error);
    res.status(500).send('Error inserting record.');
}
};
    
    exports.handleFileUploads = (req, res) => {
    const file = req.file;
    
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
            Item_code: parseInt(resul.Item_code),
            Item_name: resul.Item_name,
            category: resul.category,
            description : resul.description,
            unit: parseInt(resul.unit),
            price: parseInt(resul.price),
        }));
    
        // Save worker documents to MongoDB
        e_prods.insertMany(workerss)
            .then(() => {
            res.send('Data imported successfully');
            })
            .catch((error) => {
            res.status(500).send('Error importing data');
            });
        });
    };

