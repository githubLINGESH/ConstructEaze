const path = require('path');
const e_products = require('../model/prodModel');

exports.getMaterialPage = (req, res) => {
res.sendFile(path.join(__dirname, '..', '..', 'matinf.html'));
};

exports.submitMaterial = async (req, res) => {

try {
    const {
        Date_i,
        Vendor_name,
        Name_of_Material,
        Supplied_quantity,
    } = req.body;
        
    const materialInward = await e_products.findOne({ Vendor_name ,Name_of_Material});

    if (!materialInward) {
        return res.status(404).json({ error: 'Material not found' });
    }

    // Calculate the updated supplied quantity after outward
    const updatedreq = materialInward.Required_quantity - parseInt(Supplied_quantity);
    const updsup=materialInward.Supplied_quantity + parseInt(Supplied_quantity);
    const updatedprice = parseInt(updsup) * materialInward.Unit_prize;
    // Update the supplied quantity in the material inward entry
    materialInward.Supplied_quantity = updsup;
    materialInward.Current_stock=materialInward.Current_stock+ parseInt(updsup);
    materialInward.Required_quantity= updatedreq;
    materialInward.Date_i = Date_i;
    materialInward.Price = updatedprice;

    // Save the updated material inward entry
    await materialInward.save();
    res.status(200).send("Record Inserted successfully");
    
} catch (error) {
    console.error('Error saving material outward', error);
    res.status(500).json({ error: 'Error saving material outward' });
}
};

// Controller to render the material outward page
exports.getMaterialOutPage = async (req, res) => {
    try {
        const Materials = await e_products.find();
        res.status(200).json(Materials);
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).send('Error retrieving tasks.');
    }
    };


exports.getTasks = async (req, res) => {
try {
    const tasks = await e_products.find();
    res.status(200).json(tasks);
} catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).send('Error retrieving tasks.');
}
};

exports.searchMaterial = async (req, res) => {
    const { Name_of_Material } = req.body;

    try {
        const tasks = await e_products.find({ Name_of_Material: Name_of_Material });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error searching tasks:', error);
        res.status(500).send('Error searching tasks.');
    }
    };
