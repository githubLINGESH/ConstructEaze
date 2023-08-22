    const path = require('path');
    const e_products = require('../model/prodModel');


    exports.getProductPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'prod.html'));
    };

    exports.submitMaterial = async (req, res) => {
    const {
        Date_o,
        Vendor_name,
        Name_of_Material,
        Required_quantity,
        Current_stock,
        Unit_prize
    } = req.body;

    try {
        //const prize = parseInt(Required_quantity) * parseInt(Unit_prize);
        const record = new e_products({
        id: null,
        Date_o:Date_o,
        Date_i:null,
        Date_u:null,
        Vendor_name: Vendor_name,
        Name_of_Material: Name_of_Material,
        Required_quantity: parseInt(Required_quantity),
        Supplied_quantity: 0,
        Unit_prize: parseInt(Unit_prize),
        Used:0,
        Current_stock:parseInt(Current_stock),
        Price:0
    
        });
        await record.save();
        console.log('Record inserted successfully.');
        res.status(200).send('Record inserted successfully.');

    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
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
            const tasks = await E_product.find({ Name_of_Material: Name_of_Material });

            res.status(200).json(tasks);
        } catch (error) {
            console.error('Error searching tasks:', error);
            res.status(500).send('Error searching tasks.');
        }
        };
        exports.getProductOrders = async () => {
            try {
            const productOrders = await e_products.find();
            return productOrders;
            } catch (error) {
            throw error;
            }
        };
        
        // Function to add a new product order to the database
        exports.addProductOrder = async (productOrderData) => {
            try {
            // Perform any data validation or processing if needed
            const newProductOrder = new e_products(productOrderData);
            await newProductOrder.save();
            } catch (error) {
            throw error;
            }
        };