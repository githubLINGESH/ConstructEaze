    const e_products = require('../model/prodModel');
    const path = require('path');

    exports.getp = (req, res) => {
        res.sendFile(path.join(__dirname, '..', '..', 'matoutf.html'));
    };

// Controller to handle material outward form submission
    exports.createMaterialOut = async (req, res) => {
    try {
        const { Vendor_name,Name_of_Material, Used,Date_u} = req.body;

        // Find the material inward entry by vendor name
        const materialInward = await e_products.findOne({ Vendor_name ,Name_of_Material});

        if (!materialInward) {
            return res.status(404).json({ error: 'Material not found' });
        }

        // Calculate the updated supplied quantity after outward
        const updcur = materialInward.Current_stock- parseInt(Used);

        // Update the supplied quantity in the material inward entry
        materialInward.Date_u= Date_u;
        materialInward.Current_stock = updcur;
        materialInward.Used= materialInward.Used+ parseInt(Used);

        // Save the updated material inward entry
        await materialInward.save();
        console.log('Record inserted successfully.');
        res.status(200).send('Record inserted successfully.');
        
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
