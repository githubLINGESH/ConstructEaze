    const path = require('path');
    const e_products = require('../model/prodModel');

    exports.getMaterialPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'matinf.html'));
    };

    exports.submitMaterial = async (req, res) => {
    const userId = req.session.auth;

    try {
        const {
            Date_i,
            Vendor_name,
            Name_of_Material,
            Supplied_quantity,
            Unit_prize,
        } = req.body;
            
        const materialInward = await e_products.findOne({ Vendor_name ,Name_of_Material,order:true});

        if (!materialInward) {
            return res.status(404).json({ error: 'Material not found' });
        }
        
        // Calculate the updated supplied quantity after outward
        const updatedreq = materialInward.Required_quantity - parseInt(Supplied_quantity);
        const updsup=materialInward.Supplied_quantity + parseInt(Supplied_quantity);
        const updatedprice = parseInt(updsup) * parseInt(Unit_prize);
        console.log(Unit_prize);
        console.log(updsup);
        console.log(updatedprice);
        // Update the supplied quantity in the material inward entry
        materialInward.Supplied_quantity = updsup;
        materialInward.Current_stock=materialInward.Current_stock+ parseInt(updsup);
        materialInward.Required_quantity= updatedreq;
        materialInward.Date_i = Date_i;
        materialInward.Unit_prize=Unit_prize;
        materialInward.Price = parseInt(updatedprice);
        materialInward.userId = userId

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
        const userId = req.session.auth;

        try {
            const Materials = await e_products.find({userId:userId , order:true});
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


        exports.autosearchformat = async (req, res) => {
            const query = req.query.term.toLowerCase();
            
            try {
                const productSuggestions = await e_products.find({ Name_of_Material: { $regex: query, $options: 'i' } })
                    .select('Name_of_Material')
                    .limit(10);
        
                const vendorSuggestions = await e_products.find({ Vendor_name: { $regex: query, $options: 'i' } })
                    .select('Vendor_name')
                    .limit(10);
        
                const productNames = productSuggestions.map(task => task.Name_of_Material);
                const vendorNames = vendorSuggestions.map(task => task.Vendor_name);
        
                // Concatenate product and vendor names
                const suggestions = [...productNames, ...vendorNames];
        
                res.json(suggestions);
            } catch (error) {
                console.error('Error fetching autocomplete suggestions:', error);
                res.status(500).send('Error fetching autocomplete suggestions.');
            }
        };

        const PDFDocument = require('pdfkit');
        const ExcelJS = require('exceljs');
        
        // Assuming you have a function to fetch the product order details from the database
        
        
        exports.downloadPDF = async (req, res) => {
        const userId = req.session.auth;

        try {
            const productOrders = await e_products.find({userId:userId ,order:true });
        
            const doc = new PDFDocument();
            doc.pipe(res);
        
            doc.fontSize(18).text('MATERIAL ORDER DETAIL', { align: 'center' });
            doc.moveDown();
        
            const tableHeaders = ['Date', 'VENDOR', 'MATERIAL','SUPPLIED ','UNIT','PRICE'];
        
            const table = {
            rows: [tableHeaders],
            };
        
            productOrders.forEach((order) => {
            table.rows.push([
                order.Date_i,
                order.Vendor_name,
                order.Name_of_Material,
                //order.Required_quantity,
                order.Supplied_quantity,
                //order.Current_stock,
                order.Unit,
                order.Price,
            ]);
            });
        
            const tableTop = doc.y + 15;
            const initialX = 100;
            const rowHeight = 25;
            const columnWidth = 70;
        
            for (let i = 0; i < table.rows.length; i++) {
            const currentRow = table.rows[i];
            for (let j = 0; j < currentRow.length; j++) {
                doc
                .fontSize(10)
                .text(currentRow[j], initialX + j * columnWidth, tableTop + i * rowHeight+8, {
                    width: columnWidth,
                    align: 'center', // Center-align the text horizontally
                    valign: 'center', // Center-align the text vertically
                });
            }
            }
        
            // Add table lines
            const tableBottom = tableTop + table.rows.length * rowHeight;
            const tableRight = initialX + tableHeaders.length * columnWidth;
        
            doc.moveTo(initialX, tableTop).lineTo(initialX, tableBottom).stroke(); // Vertical line on the left
            doc.moveTo(tableRight, tableTop).lineTo(tableRight, tableBottom).stroke(); // Vertical line on the right
        
            for (let i = 0; i <= table.rows.length; i++) {
            const y = tableTop + i * rowHeight;
            doc.moveTo(initialX, y).lineTo(tableRight, y).stroke(); // Horizontal lines
            }
        
            doc.end();
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).send('Error generating PDF');
        }
        };