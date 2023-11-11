    const e_products = require('../model/prodModel');
    const e_stock = require('../model/stockModel');
        const path = require('path');

        exports.getp = (req, res) => {
            res.sendFile(path.join(__dirname, '..', '..', 'matoutf.html'));
        };

        exports.updatestocks = async(req,res) =>{

            try {

                console.log("comming here in server side")
                // Access form fields and product rows from the request body
                const product_name = req.body.productName;
                const Used = req.body.usedQuantity;

                console.log(product_name);
                console.log(Used);


                const existingPurchaseOrder = await e_stock.findOne({product_name: product_name});

                    if(!existingPurchaseOrder){
                        return res.status(404).json({ error: 'PO not found' });
                    }

                    existingPurchaseOrder.used += Used;

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
            // Get distinct materials with an order
            const materialsWithOrder = await e_products.distinct('products.nameOfMaterial', { 'products.order': true });
    
            for (const nameOfMaterial of materialsWithOrder) {
                // Aggregate to calculate the total supplied quantity for the current nameOfMaterial
                const totalSuppliedQuantity = await e_products.aggregate([
                    { $unwind: '$products' },
                    { $match: { 'products.nameOfMaterial': nameOfMaterial, 'products.order': true, 'products.nameOfMaterial': { $ne: null } } },
                    { $group: { _id: '$products.nameOfMaterial', totalSuppliedQuantity: { $sum: '$products.suppliedQuantity' } } },
                ]);
                
    
                console.log("::::", totalSuppliedQuantity);
                console.log(nameOfMaterial);
    
                if (totalSuppliedQuantity.length > 0) {
                    for (const material of totalSuppliedQuantity) {
                        const nameOfMaterial = material._id; // Get the nameOfMaterial
                        const total = material.totalSuppliedQuantity; // Get the total supplied quantity
                
                        if (nameOfMaterial !== null) {
                            // Find the existing stock item
                            const existingStockItem = await e_stock.findOne({ product_name: nameOfMaterial });
                
                            if (existingStockItem) {
                                // Update the existing record with the new total
                                existingStockItem.totalSuppliedQuantity = total;
                                console.log("existing:", existingStockItem);
                                await existingStockItem.save();
                            } else {
                                // Create a new stock item record
                                const stockItem = new e_stock({
                                    product_name: nameOfMaterial,
                                    totalSuppliedQuantity: total,
                                    used: 0,

                                });
                                await stockItem.save();
                                console.log("before", nameOfMaterial);
                                console.log("name:", nameOfMaterial);
                                console.log("maybe");
                            }
                
                            console.log('Updated material:', nameOfMaterial, 'Total supplied quantity:', total);
                        } else {
                            // Skip inserting documents with null nameOfMaterial
                            console.log('Skipped material with null nameOfMaterial');
                        }
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
        const totalSuppliedQuantities = await e_stock.find();
    
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