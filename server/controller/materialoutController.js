    const e_products = require('../model/prodModel');
    const e_stock = require('../model/stockModel');
        const path = require('path');

        exports.getp = (req, res) => {
            res.sendFile(path.join(__dirname, '..', '..', 'matoutf.html'));
        };

        exports.updatestocks = async(req,res) =>{

            try {
                const projectId  = req.session.projectId
                // Access form fields and product rows from the request body
                const product_name = req.body.productName;
                const Used = req.body.usedQuantity;

                console.log(product_name);
                console.log(Used);


                const existingPurchaseOrder = await e_stock.findOne({product_name: product_name , projectId: projectId});

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
            const projectId  = req.session.projectId
            // Get distinct materials with an order
            const materialsWithOrder = await e_products.distinct('products.nameOfMaterial', { 'products.order': true });
    
            for (const nameOfMaterial of materialsWithOrder) {
                // Aggregate to calculate the total supplied quantity for the current nameOfMaterial
                const totalSuppliedQuantity = await e_products.aggregate([
                    { $unwind: '$products' },
                    { $match: {projectId: projectId, 'products.nameOfMaterial': nameOfMaterial, 'products.order': true, 'products.nameOfMaterial': { $ne: null } } },
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
                                    projectId: projectId,
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
        const projectId  = req.session.projectId
        const totalSuppliedQuantities = await e_stock.find({projectId: projectId});
    
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
                    const productSuggestions = await e_stock.find({ product_name: { $regex: query, $options: 'i' } })
                        .select('product_name')
                        .limit(10);
            
            
                    const productNames = productSuggestions.map(item => item.product_name);
            
                    // Concatenate product and vendor names
                    const suggestions = [...productNames];
            
                    res.json(suggestions);
                } catch (error) {
                    console.error('Error fetching autocomplete suggestions:', error);
                    res.status(500).send('Error fetching autocomplete suggestions.');
                }
            };
        

            const PDFDocument = require('pdfkit');

    exports.download = async (req, res) => {
    try {

        const productOrders = await e_stock.find({projectId: projectId});

        const doc = new PDFDocument();
        res.setHeader('Content-Disposition', 'attachment; filename=task_details.pdf');
        doc.pipe(res);

        doc.fontSize(18).text('Material Wise Details', { align: 'center' });
        doc.moveDown();

        // Define the table object here
        const table = {
        headers: ['Product Name','Total supplied', 'Current Stock', 'Used'],
        rows: []
        };

        // Loop through each order and product
        productOrders.forEach(order => {
        
            table.rows.push([
                order.product_name,
                order.totalSuppliedQuantity,
                order.currentStock,
                order.used,
            ]);
            });
        
        

        // Now you can generate the table as you intended
        const initialX = 50;
        const rowHeight = 25;
        const columnWidth = 100;

        // Draw the table header
        doc.fontSize(12);
        table.headers.forEach((header, i) => {
        doc.text(header, initialX + i * columnWidth, doc.y, { width: columnWidth });
        });
        doc.moveDown();

        // Draw the table rows
        table.rows.forEach((row, i) => {
        row.forEach((text, j) => {
            doc.text(text, initialX + j * columnWidth, doc.y, { width: columnWidth });
        });
        doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
    };



            