const path = require('path');
//const e_prods = require('../model/prodfModel');
const fs = require('fs');
const csv = require('csv-parser');
const { name } = require('ejs');
const e_products = require('../model/prodModel');

exports.getpage = async(req,res) => {
res.sendFile(path.join(__dirname, '..', '..','prodf.html'));
};

exports.submitprod = async (req, res) => {
const { name, firm_name,address,Gst, phone,Item_code ,Item_name , category , unit } = req.body;

const userId = req.session.auth;
const role = req.session.role;

try {
    const record = new e_products({
        userId:userId,
        //id: Number,
        Date_o: null ,
        Date_i:null ,
        Date_u: null,
        flag: true,
        order: false,
        Vendor_name: name,
        Firmname: firm_name,
        Address: address,
        Gst: Gst,
        Phone: phone,
        Item_code : Item_code,
        Name_of_Material: Item_name,
        Category: category,
        Unit: unit,
        Unit_prize:null,
        Required_quantity: 0,
        Supplied_quantity: 0,
        Used: 0,
        Current_stock: 0,
        Price: null
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

    const userId = req.session.auth;
    const role = req.session.role;
    
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
            userId:userId,
            role:role,
            flag: true,
            Vendor_name: resul.name,
            Firmname: resul.firm_name,
            Address: resul.address,
            Gst: parseInt(resul.Gst),
            Phone: parseInt(resul.phone),
            Item_code: parseInt(resul.Item_code),
            Name_of_Material: resul.Item_name,
            Category: resul.category,
            Unit: resul.unit,

            }));
    
        // Save worker documents to MongoDB
        e_products.insertMany(workerss)
            .then(() => {
            res.send('Data imported successfully');
            })
            .catch((error) => {
            res.status(500).send('Error importing data');
            });
        });
    };