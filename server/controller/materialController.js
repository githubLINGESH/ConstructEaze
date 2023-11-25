    const path = require('path');
    const e_products = require('../model/prodModel');

    exports.getMaterialPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'matinf.html'));
    };

    exports.getPurchaseNo = async(req,res) => {
        try {
            const projectId = req.session.projectId;
            const pNos = await e_products.find().distinct('purchaseOrderNo', { projectId: projectId });
            res.json(pNos);
        } catch (error) {
            console.error('Error fetching pNos:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

        async function findMaxNoPNo(projectId) {
            try {
            const maxPurchaseOrder = await e_products
                .findOne({ projectId: projectId }) // Find by projectId
                .sort({ purchaseOrderNo: -1 }) // Sort in descending order to get the max value
                .select('purchaseOrderNo');
        
            if (maxPurchaseOrder) {
                return parseInt(maxPurchaseOrder.purchaseOrderNo) + 1;
            } else {
                // No existing PurchaseOrder, start from 1
                return 1;
            }
            } catch (error) {
            console.error('Error finding max NoPNo:', error);
            throw error;
            }
        }

        exports.submitMaterial = async (req, res) => {
            try {
              // Access form fields and product rows from the request body
                const purchaseOrderNo = req.body.purchaseOrderNo;
                console.log(purchaseOrderNo);
                const projectId = req.session.projectId;

                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);
            
                if (purchaseOrderNo === null || purchaseOrderNo === undefined || purchaseOrderNo === '') {
                    // PurchaseOrderNo is not provided, create a new document
            
                    const vendorName = req.body.vendorName;
                    const address = req.body.address;
                    const gst = req.body.gst;
                    const site = req.body.site;
                    const products = req.body.products;
                    const tax = req.body.tax;
                    const grandTotal = req.body.grandTotal;
            
                    // Find the max NoPNo
                    const NoPNo = await findMaxNoPNo(projectId);
            
                    // Create a new PurchaseOrder document
                    const newPurchaseOrder = new e_products({
                    date: today,
                    projectId: projectId,
                    purchaseOrderNo: NoPNo, // Assign the generated NoPNo
                    vendor: {
                        vendorName: vendorName,
                        address: address,
                        gst: gst,
                        site: site,
                    },
                    products: products,
                    tax:tax,
                    grandTotal:grandTotal
                    });
            
                    // Save the new PurchaseOrder to the database
                    const savedPurchaseOrder = await newPurchaseOrder.save();
            
                    res.status(201).json(savedPurchaseOrder);
                } else {
                    // PurchaseOrderNo is provided, update an existing document
            
                    const products = req.body.products;
                    const projectId = req.session.projectId;
                    const tax = req.body.tax;
                    const grandTotal = req.body.grandTotal;


                    console.log(tax)
            
                    const updatedPurchaseOrder = await e_products.findOneAndUpdate(
                    { 'purchaseOrderNo': purchaseOrderNo , projectId:projectId},
                        {
                            $set: {
                            products: products,
                            tax: tax,
                            }
                        },
                    { new: true } // To return the updated document
                    );
            
                    if (!updatedPurchaseOrder) {
                    return res.status(404).json({ error: 'PO not found' });
                    }
            
                    res.status(201).json(updatedPurchaseOrder);
                }
                } catch (error) {
                console.error('Error saving PO', error);
                res.status(500).json({ error: 'Error saving PO' });
                }
            };
            
    

            exports.getPurchaseDet = async (req, res) => {
                const selectedPno = req.params.selectedPno;
                const projectId = req.session.projectId;
                console.log(selectedPno);
                    try {
                    const purchaseOrder = await e_products.findOne({ 'purchaseOrderNo': selectedPno, 'projectId': projectId });
                    if (purchaseOrder) {
                        // Calculate the final total
                        let finalTotal = purchaseOrder.products.reduce((acc, product) => {
                        return acc + (product.total ? product.total : 0);
                        }, 0);
                
                        const details = {
                        products: purchaseOrder.products,
                        vendorName: purchaseOrder.vendor.vendorName,
                        site: purchaseOrder.vendor.site,
                        gst: purchaseOrder.vendor.gst,
                        add: purchaseOrder.vendor.address,
                        finalTotal: finalTotal,
                        tax : purchaseOrder.tax,
                        grandTotal : purchaseOrder.grandTotal

                        };
                
                        res.json(details);
                    } else {
                        res.status(404).json({ message: 'Purchase Order not found' });
                    }
                    } catch (error) {
                    console.error('Error retrieving purchase order details:', error);
                    res.status(500).json({ message: 'Error retrieving purchase order details' });
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