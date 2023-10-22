    const e_products = require('../model/prodModel');
    const e_stock = require('../model/stockModel');
        const path = require('path');

        exports.getp = (req, res) => {
            res.sendFile(path.join(__dirname, '..', '..', 'matoutf.html'));
        };

        exports.updatestocks = async(req,res) =>{

            try {
                // Access form fields and product rows from the request body
                const purchaseOrderNo = req.body.purchaseOrderNo;
                const Used = req.body.Used;

                const products = req.body.products;

                const existingPurchaseOrder = await e_stock.findOne({
                    'purchaseOrderNo': purchaseOrderNo,
                    });

                    if(!existingPurchaseOrder){
                        return res.status(404).json({ error: 'PO not found' });
                    }

                    existingPurchaseOrder.products = products;

                    await existingPurchaseOrder.save();
                    res.status(201).json(existingPurchaseOrder);
                }
                catch(error) {
                    console.error('Error saving PO', error);
                    res.status(500).json({ error: 'Error saving PO' });
        }
    };

    exports.updateTotalSuppliedQuantity = async (req, res) => {
        try {
            const materialsWithOrder = await e_products.distinct('products.nameOfMaterial', { 'products.order': true });

for (const nameOfMaterial of materialsWithOrder) {
    const totalSuppliedQuantity = await e_products.aggregate([
        {
            $unwind: '$products', // Unwind the products array
        },
        {
            $match: {
                'products.nameOfMaterial': nameOfMaterial,
                'products.order': true,
            },
        },
        {
            $group: {
                _id: null,
                totalSuppliedQuantity: {
                    $sum: '$products.suppliedQuantity',
                },
            },
        },
    ]);

    if (totalSuppliedQuantity.length > 0) {
        const total = totalSuppliedQuantity[0].totalSuppliedQuantity;

        if (nameOfMaterial) {
            // Check if a record with the same nameOfMaterial exists in e_stocks
            const existingStockItem = await e_stock.findOne({ nameOfMaterial: nameOfMaterial });

            if (existingStockItem) {
                // Update the existing record
                existingStockItem.totalSuppliedQuantity += total;
                await existingStockItem.save();
            } else {
                // Create a new stock item if it doesn't exist
                const newStockItem = new e_stock({
                    nameOfMaterial: nameOfMaterial,
                    totalSuppliedQuantity: total,
                });
                await newStockItem.save();
            }

            console.log('Updating material:', nameOfMaterial);
            console.log('Total supplied quantity:', total);
        } else {
            console.error('Null or undefined nameOfMaterial encountered. Skipping...');
        }
    }
}
            res.status(200).json({ message: 'Total supplied quantities updated in e_stocks' });
        } catch (error) {
            console.error('Error updating supplied quantity:', error);
            res.status(500).json({ error: 'Error updating supplied quantity' });
        }
    };

    exports.getstocks = async (req, res) => {
        try {
        const totalSuppliedQuantities = await e_stock.find({}, { nameOfMaterial: 1, totalSuppliedQuantity: 1 });
    
        res.status(200).json(totalSuppliedQuantities);
        } catch (error) {
        console.error('Error fetching total supplied quantities:', error);
        res.status(500).json({ error: 'Error fetching total supplied quantities' });
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