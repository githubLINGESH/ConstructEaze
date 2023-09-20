    const e_products = require('../model/prodModel');
    const path = require('path');

    exports.getp = (req, res) => {
        res.sendFile(path.join(__dirname, '..', '..', 'matoutf.html'));
    };

    // Controller to handle material outward form submission
    exports.createMaterialOut = async (req, res) => {
        const userId = req.session.auth;
    try {
        const { Vendor_name,Name_of_Material, Used,Date_u} = req.body;

        // Find the material inward entry by vendor name
        const materialInward = await e_products.findOne({ Vendor_name ,Name_of_Material,order:true});

        if (!materialInward) {
            return res.status(404).json({ error: 'Material not found' });
        }

        // Calculate the updated supplied quantity after outward
        const updcur = materialInward.Current_stock - parseInt(Used);

        // Update the supplied quantity in the material inward entry
        materialInward.Date_u= Date_u;
        materialInward.Current_stock = updcur;
        materialInward.Used= materialInward.Used+ parseInt(Used);
        materialInward.userId = userId;

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
        const userId = req.session.auth;
        try {
            const Materials = await e_products.find({userId:userId,order:true});
            res.status(200).json(Materials);
        } catch (error) {
            console.error('Error retrieving tasks:', error);
            res.status(500).send('Error retrieving tasks.');
        }
        };

        exports.autosearchformato = async (req, res) => {
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

        exports.downloadPDF = async (req, res) => {
            const userId = req.session.auth;
        try {
            const productOrders = await e_products.find({ userId:userId,order: true });
        
            const doc = new PDFDocument();
            doc.pipe(res);
        
            doc.fontSize(18).text('MATERIAL OUTWARD DETAILS', { align: 'center' });
            doc.moveDown();
        
            const tableHeaders = ['DATE', 'VENDOR NAME', 'MATERIAL', 'SUPPLIED ', 'USED', 'CURRENT STOCK'];
        
            const table = {
            rows: [tableHeaders],
            };
        
            productOrders.forEach((order) => {
            table.rows.push([
                order.Date_u,
                order.Vendor_name,
                order.Name_of_Material,
                order.Supplied_quantity,
                order.Used,
                order.Current_stock,
            ]);
            });
        
            const tableTop = doc.y + 10; // Increase the top margin for spacing
            const initialX = 70;
            const rowHeight = 25; // Increase the row height for spacing
            const columnWidth = 80;
        
            for (let i = 0; i < table.rows.length; i++) {
            const currentRow = table.rows[i];
            for (let j = 0; j < currentRow.length; j++) {
                doc
                .fontSize(9)
                .text(currentRow[j], initialX + j * columnWidth, tableTop + i * rowHeight+8, {
                    width: columnWidth,
                    align: 'center', // Center-align the text horizontally
                    valign: 'center', // Center-align the text vertically
                });
            }
            }
        
            // Add table lines
            const tableBottom = tableTop + table.rows.length * rowHeight;
            const tableRight = initialX + tableHeaders.length * columnWidth+10;
        
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
        