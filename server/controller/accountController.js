    const e_products = require('../model/prodModel');
        const path = require('path');
        const PDFDocument = require('pdfkit');
        const ExcelJS = require('exceljs');

        const {getVendorDetails } = require('../controller/prodController');


        exports.getaccountpage = (req, res) => {
        res.sendFile(path.join(__dirname, '..', '..', 'accst.html'));
        };

        exports.getVendorNames = async (req, res) => {
        try {
            const projectId = req.session.projectId;

            const vendorNames = await e_products.distinct('vendor.vendorName', { 'vendor.projectId': projectId });
            res.json(vendorNames);
            } catch (error) {
            console.error('Error fetching vendor names:', error);
            res.status(500).json({ message: 'Internal server error' });
            }
        };
        

        exports.getProductNames = async (req, res) => {
        try {

            const projectId = req.session.projectId;
            const productNames = await e_products.find({ 'projectId': projectId }).distinct("products.nameOfMaterial");
            res.json(productNames);
            } catch (error) {
            console.error('Error fetching product names:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
        };

        exports.getVendorDetails = async (req, res) => {
        try {
            
            const vendorName = req.params.vendorName;
            const vendorDetails = await e_products.findOne({ Vendor_name: vendorName });
            res.json(vendorDetails);
        } catch (error) {
            console.error('Error fetching vendor details:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
        };

        exports.getVendorDetailsWithinDateRange = async (req, res) => {
        try {
            const vendorName = req.params.vendorName;
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);

            // Assuming you have a 'date' field in your documents to filter by date
            const vendorDetails = await e_products.find({
            Vendor_name: vendorName,
            date: {
                $gte: startDate,
                $lte: endDate
            }
            });

            res.json(vendorDetails);
        } catch (error) {
            console.error('Error fetching vendor details within date range:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
        };

        exports.getProductDetails = async (req, res) => {
        try {
            const productName = req.params.productName;
            const productDetails = await e_products.find({ Name_of_Material: productName });
            res.json(productDetails);
        } catch (error) {
            console.error('Error fetching product details:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
        };


        exports.downloadPDF = async (req, res) => {
            try {
            const projectId = req.session.projectId;
            const vendorName = req.params.vendorName;
            const dateArray = JSON.parse(req.body.dateArray);
        
            const productOrders = await getVendorDetails(vendorName , projectId); // Fetch details from the database
        
            const doc = new PDFDocument();
            res.setHeader('Content-Disposition', 'attachment; filename=material_details.pdf');
            doc.pipe(res);
        
            doc.fontSize(18).text('Material Wise Details', { align: 'center' });
            doc.moveDown();
        
            // Define the table object here
            const table = {
                headers: ['Date', 'Vendor', 'Address', 'GST', 'Site', 'Material', 'Used', 'Current Stock'],
                rows: []
            };
        
            // Loop through each order and product
            productOrders.forEach(order => {
                if (!dateArray || dateArray.length === 0) {
                // Handle the case where dateArray is not provided
                if (order.products) {
                order.products.forEach(product => {
                    const orderDateObj = new Date(order.date);
                    const formattedDate = orderDateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    });
            
                    table.rows.push([
                    formattedDate,
                    order.vendor.vendorName,
                    order.vendor.address,
                    order.vendor.gst,
                    order.vendor.site,
                    product.nameOfMaterial,
                    product.used,
                    product.currentStock
                    ]);
                });
                }
                } else {
                dateArray.forEach(selectedDate => {
                    const selectedDateObj = new Date(selectedDate);
                    if (order.products) {
                    order.products.forEach(product => {
                    const orderDateObj = new Date(order.date);
                    if (
                        selectedDateObj.getFullYear() === orderDateObj.getFullYear() &&
                        selectedDateObj.getMonth() === orderDateObj.getMonth() &&
                        selectedDateObj.getDate() === orderDateObj.getDate()
                    ) {
                        const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        });
            
                        table.rows.push([
                        formattedDate,
                        order.vendor.vendorName,
                        order.vendor.address,
                        order.vendor.gst,
                        order.vendor.site,
                        product.nameOfMaterial,
                        product.used,
                        product.currentStock
                        ]);
                    }
                    });
                }
                });
            }
            });
            
        
        const initialY = doc.y + 10; // Added padding
        const columnWidth = 60; // Adjusted column width
        const totalWidth = table.headers.length * columnWidth;
    
        // Center the table horizontally
        const initialX = (doc.page.width - totalWidth) / 2;
    
        // Draw the table header
        doc.fontSize(12).fillColor('#000');
        table.headers.forEach((header, i) => {
            doc.text(header, initialX + i * columnWidth, initialY, { width: columnWidth, align: 'center' });
        });
        doc.moveDown();
    
        // Set the initial y position for the rows
        const rowHeight = 25;
        let currentY = doc.y;
    
        // Draw the table rows
        table.rows.forEach((row, i) => {
            doc.fontSize(10).fillColor('#333');
            row.forEach((text, j) => {
            doc.text(text, initialX + j * columnWidth, currentY, { width: columnWidth, align: 'center' });
            });
            currentY += rowHeight;
            doc.moveDown();
        });
        
            doc.end();
            } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).send('Error generating PDF');
            }
        };
        
        
        exports.downloadExcel = async (req, res) => {
            try {
            const vendorName = req.params.vendorName;
            const dateArray = JSON.parse(req.body.dateArray);
            const projectId = req.session.projectId;
        
            console.log('Date Array:', dateArray);
        
            const productOrders = await getVendorDetails(vendorName,projectId);
            console.log('Product Orders:', productOrders);
        
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Material Report');
        
            // Define the columns
            worksheet.columns = [
                { header: 'Date', key: 'date' },
                { header: 'Vendor', key: 'vendorName' },
                { header: 'Address', key: 'address' },
                { header: 'GST', key: 'gst' },
                { header: 'Site', key: 'site' },
                { header: 'Material', key: 'nameOfMaterial' },
                { header: 'Unit', key: 'unit' },
                { header: 'Used', key: 'used' },
            ];
        
            for (const order of productOrders) {
                let includeRecord = true;
                let formattedDate = '';
        
                if (dateArray && dateArray.length > 0) {
                includeRecord = false;
        
                for (const selectedDate of dateArray) {
                    const selectedDateObj = new Date(selectedDate);
                    const orderDateObj = new Date(order.date);
        
                    if (
                    selectedDateObj.getFullYear() === orderDateObj.getFullYear() &&
                    selectedDateObj.getMonth() === orderDateObj.getMonth() &&
                    selectedDateObj.getDate() === orderDateObj.getDate()
                    ) {
                    includeRecord = true;
                    formattedDate = selectedDateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    });
                    break;
                    }
                }
                }
        
                if (includeRecord && order.products && order.products.length > 0) {
                for (const product of order.products) {
                    worksheet.addRow({
                    date: formattedDate,
                    vendorName: order.vendor.vendorName,
                    address: order.vendor.address,
                    gst: order.vendor.gst,
                    site: order.vendor.site,
                    nameOfMaterial: product.nameOfMaterial,
                    unit: product.unit,
                    used: product.used ? 'Yes' : 'No',
                    });
                }
                }
            }
        
            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="material_details.xlsx"');
            res.send(buffer);
            } catch (error) {
            console.error('Error generating Excel:', error);
            res.status(500).send('Error generating Excel');
            }
        };


        const { getProductOrders } = require('../controller/prodController');

        exports.downloadPDFProd = async (req, res) => {
            try {
                const productName = req.params.productName;
                const dateArray = JSON.parse(req.body.dateArray);
            
                const productOrders = await getProductOrders(productName);
            
                const doc = new PDFDocument();
                res.setHeader('Content-Disposition', 'attachment; filename=material_details.pdf');
                doc.pipe(res);
            
                // Set font style for the document
                doc.font('Helvetica-Bold');
            
                doc.fontSize(18).text('Material Wise Details', { align: 'center' });
                doc.moveDown();
            
                // Define the table object here
                const table = {
                    headers: ['Date', 'Vendor', 'Address', 'GST', 'Site', 'Material'],
                    rows: []
                };
            
                // Populate the table rows
                productOrders.forEach(order => {
                    if (!dateArray || dateArray.length === 0) {
                    // If dateArray is null or empty, include all records
                    order.products.forEach(product => {
                        const orderDateObj = new Date(order.date);
                        const formattedDate = orderDateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        });
                        const nameOfMaterial = product.nameOfMaterial;
                        const currentStock = product.currentStock;
            
                        table.rows.push([
                        formattedDate,
                        order.vendor.vendorName,
                        order.vendor.address,
                        order.vendor.gst,
                        order.vendor.site,
                        nameOfMaterial,
                        product.used,
                        currentStock
                        ]);
                    });
                    } else {
                    // If dateArray is not null, filter records based on date
                    dateArray.forEach(selectedDate => {
                        const selectedDateObj = new Date(selectedDate);
                        order.products.forEach(product => {
                        const orderDateObj = new Date(order.date);
            
                        if (
                            selectedDateObj.getFullYear() === orderDateObj.getFullYear() &&
                            selectedDateObj.getMonth() === orderDateObj.getMonth() &&
                            selectedDateObj.getDate() === orderDateObj.getDate()
                        ) {
                            const formattedDate = orderDateObj.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            });
                            const nameOfMaterial = product.nameOfMaterial;
                            const currentStock = product.currentStock;
            
                            table.rows.push([
                            formattedDate,
                            order.vendor.vendorName,
                            order.vendor.address,
                            order.vendor.gst,
                            order.vendor.site,
                            nameOfMaterial,
                            product.used,
                            currentStock
                            ]);
                        }
                        });
                    });
                    }
                });
            
                // Set font style for the table
                doc.font('Helvetica');
            
                const initialY = doc.y + 10; // Added padding
                const columnWidth = 60; // Adjusted column width
                const totalWidth = table.headers.length * columnWidth;
            
                // Center the table horizontally
                const initialX = (doc.page.width - totalWidth) / 2;
            
                // Draw the table header
                doc.fontSize(12).fillColor('#000');
                table.headers.forEach((header, i) => {
                doc.text(header, initialX + i * columnWidth, initialY, { width: columnWidth, align: 'center' });
                });
                doc.moveDown();
            
                // Set the initial y position for the rows
                const rowHeight = 25;
                let currentY = doc.y;
            
                // Draw the table rows
                table.rows.forEach((row, i) => {
                doc.fontSize(10).fillColor('#333');
                row.forEach((text, j) => {
                    doc.text(text, initialX + j * columnWidth, currentY, { width: columnWidth, align: 'center' });
                });
                currentY += rowHeight;
                doc.moveDown();
                });
            
                doc.end();
            
                } catch (error) {
                console.error('Error generating PDF:', error);
                res.status(500).send('Error generating PDF');
                }
            };
            
            
            
            
            exports.downloadExcelProd = async (req, res) => {
            try {
                const productName = req.params.productName;
                const dateArray = JSON.parse(req.body.dateArray); // Parse the JSON string back to an array
            
                console.log('Date Array:', dateArray);
            
                const productOrders = await getProductOrders(productName);
                console.log('Product Orders:', productOrders);
            
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Material Report');
            
                // Define the columns
                worksheet.columns = [
                    { header: 'Date', key: 'date' },
                    { header: 'Vendor', key: 'vendorName' },
                    { header: 'Address', key: 'address' },
                    { header: 'GST', key: 'gst' },
                    { header: 'Site', key: 'site' },
                    { header: 'Material', key: 'nameOfMaterial' },
                    { header: 'Unit', key: 'unit' },
                ];
            
                for (const order of productOrders) {
                    let includeRecord = true;
                    let formattedDate = '';
            
                    if (dateArray && dateArray.length > 0) {
                    includeRecord = false;
            
                    for (const selectedDate of dateArray) {
                        const selectedDateObj = new Date(selectedDate);
                        const orderDateObj = new Date(order.date);
            
                        if (
                        selectedDateObj.getFullYear() === orderDateObj.getFullYear() &&
                        selectedDateObj.getMonth() === orderDateObj.getMonth() &&
                        selectedDateObj.getDate() === orderDateObj.getDate()
                        ) {
                        includeRecord = true;
                        formattedDate = selectedDateObj.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });
                        break; // No need to check further dates
                        }
                    }
                    }
            
                    if (includeRecord) {
                    for (const product of order.products) {
                        // Add data to Excel worksheet
                        worksheet.addRow({
                        date: formattedDate,
                        vendorName: order.vendor.vendorName,
                        address: order.vendor.address,
                        gst: order.vendor.gst,
                        site: order.vendor.site,
                        nameOfMaterial: product.nameOfMaterial,
                        unit: product.unit,
                        used: product.used ? 'Yes' : 'No',
                        });
            
                    }
                    }
                }
            
                const buffer = await workbook.xlsx.writeBuffer();
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename="material_details.xlsx"');
                res.send(buffer);
            } catch (error) {
                console.error('Error generating Excel:', error);
                res.status(500).send('Error generating Excel');
            }
            };


        exports.downloadPDFOverall = async (req, res) => {
            try {

                const productOrders = await e_products.find();
                console.log(productOrders);
                

                const doc = new PDFDocument();
                res.setHeader('Content-Disposition', 'attachment; filename=overall_material_details.pdf');
                doc.pipe(res);

                doc.fontSize(18).text('Overall Material Details', { align: 'center' });
                doc.moveDown();

                const table = {
                headers: ['PO','Date','Vendor','Product','Unit','Unit Price','Price','GST','Total'],
                rows: []
                };

                // Populate the table rows
                productOrders.forEach(order => {
                // Check if order or order.products is null or undefined
                if (!order || !order.products) {
                    console.error('Order or products in order are null or undefined:', order);
                    return;
                }

                order.products.forEach(product => {
                    // Check if product is null or undefined
                    if (!product) {
                    console.error('Product is null or undefined in order:', order);
                    return;
                    }

                    table.rows.push([
                    order.purchaseOrderNo,
                    order.date ? order.date.toLocaleDateString('en-US') : 'N/A',
                    order.vendor.vendorName,
                    product.nameOfMaterial,
                    product.unit,
                    product.unitPrice,
                    product.price,
                    product.gst,
                    product.total
                    ]);
                });
                });

                const initialY = doc.y + 10; // Added padding
                const columnWidth = 60; // Adjusted column width
                const totalWidth = table.headers.length * columnWidth;
            
                // Center the table horizontally
                const initialX = (doc.page.width - totalWidth) / 2;
            
                // Draw the table header
                doc.fontSize(12).fillColor('#000');
                table.headers.forEach((header, i) => {
                    doc.text(header, initialX + i * columnWidth, initialY, { width: columnWidth, align: 'center' });
                });
                doc.moveDown();


                // Set the initial y position for the rows
                const rowHeight = 25;
                let currentY = doc.y;

                // Draw the table rows
                table.rows.forEach((row, i) => {
                doc.fontSize(10).fillColor('#333');
                row.forEach((text, j) => {
                    doc.text(text, initialX + j * columnWidth, currentY, { width: columnWidth, align: 'center' });
                });
                currentY += rowHeight;
                doc.moveDown();
                });

                doc.end();
            } catch (error) {
                console.error('Error generating PDF:', error);
                res.status(500).send('Error generating PDF');
            }
            };

            exports.downloadExcelOverall = async (req, res) => {
            try {
                const productOrders = await e_products.find();

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Overall Material Report');

                // Define the columns
                worksheet.columns = [
                { header: 'Purchase Order No', key: 'purchaseOrderNo' },
                { header: 'Date', key: 'date' },
                { header: 'Vendor Name', key: 'vendorName' },
                { header: 'Product Name', key: 'nameOfMaterial' },
                { header: 'Unit', key: 'unit' },
                { header: 'Unit Price', key: 'unitPrice' },
                { header: 'Price', key: 'price' },
                { header: 'GST', key: 'gst' },
                { header: 'Total', key: 'total' },
                ];

                // Loop through each order and product
            // Populate the table rows
            productOrders.forEach(order => {
                // Check if order or order.products is null or undefined
                if (!order || !order.products) {
                console.error('Order or products in order are null or undefined:', order);
                return;
                }

                order.products.forEach(product => {
                // Check if product is null or undefined
                if (!product) {
                    console.error('Product is null or undefined in order:', order);
                    return;
                }

                worksheet.addRow([
                    order.purchaseOrderNo,
                    order.date ? order.date.toLocaleDateString('en-US') : 'N/A',
                    order.vendor.vendorName,
                    product.nameOfMaterial,
                    product.unit,
                    product.unitPrice,
                    product.price,
                    product.gst,
                    product.total
                ]);
                });
            });

                const buffer = await workbook.xlsx.writeBuffer();
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename="overall_material_details.xlsx"');
                res.send(buffer);
            } catch (error) {
                console.error('Error generating Excel:', error);
                res.status(500).send('Error generating Excel');
            }
            };
            
        

            exports.downloadPDFallvendor = async (req, res) => {
                try {
                const projectId = req.session.projectId;
                const dateArray = JSON.parse(req.body.dateArray); // Parse the JSON string back to an array
            
                const productOrders = await e_products.find({projectId: projectId}); // Fetch details from the database
            
                const doc = new PDFDocument();
                res.setHeader('Content-Disposition', 'attachment; filename=material_details.pdf');
                doc.pipe(res);
            
                doc.fontSize(18).text('Material Wise Details', { align: 'center' });
                doc.moveDown();
            
                // Define the table object here
                const table = {
                    headers: ['Date', 'Vendor', 'Address', 'GST', 'Site', 'Material', 'Used', 'Current Stock'],
                    rows: []
                };
            
                // Loop through each order and product
                productOrders.forEach(order => {
                    if (!dateArray || dateArray.length === 0) {
                    // Handle the case where dateArray is not provided
                    if (order.products) {
                    order.products.forEach(product => {
                        const orderDateObj = new Date(order.date);
                        const formattedDate = orderDateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        });
                
                        table.rows.push([
                        formattedDate,
                        order.vendor.vendorName,
                        order.vendor.address,
                        order.vendor.gst,
                        order.vendor.site,
                        product.nameOfMaterial,
                        product.used,
                        product.currentStock
                        ]);
                    });
                    }
                    } else {
                    dateArray.forEach(selectedDate => {
                        const selectedDateObj = new Date(selectedDate);
                        if (order.products) {
                        order.products.forEach(product => {
                        const orderDateObj = new Date(order.date);
                        if (
                            selectedDateObj.getFullYear() === orderDateObj.getFullYear() &&
                            selectedDateObj.getMonth() === orderDateObj.getMonth() &&
                            selectedDateObj.getDate() === orderDateObj.getDate()
                        ) {
                            const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            });
                
                            table.rows.push([
                            formattedDate,
                            order.vendor.vendorName,
                            order.vendor.address,
                            order.vendor.gst,
                            order.vendor.site,
                            product.nameOfMaterial,
                            product.used,
                            product.currentStock
                            ]);
                        }
                        });
                    }
                    });
                }
                });
                
            
                // Now you can generate the table as you intended
            const initialY = doc.y + 10; // Added padding
            const columnWidth = 60; // Adjusted column width
            const totalWidth = table.headers.length * columnWidth;
        
            // Center the table horizontally
            const initialX = (doc.page.width - totalWidth) / 2;
        
            // Draw the table header
            doc.fontSize(12).fillColor('#000');
            table.headers.forEach((header, i) => {
                doc.text(header, initialX + i * columnWidth, initialY, { width: columnWidth, align: 'center' });
            });
            doc.moveDown();
        
            // Set the initial y position for the rows
            const rowHeight = 25;
            let currentY = doc.y;
        
            // Draw the table rows
            table.rows.forEach((row, i) => {
                doc.fontSize(10).fillColor('#333');
                row.forEach((text, j) => {
                doc.text(text, initialX + j * columnWidth, currentY, { width: columnWidth, align: 'center' });
                });
                currentY += rowHeight;
                doc.moveDown();
            });
            
                doc.end();
                } catch (error) {
                console.error('Error generating PDF:', error);
                res.status(500).send('Error generating PDF');
                }
            };
            
            
            exports.downloadExcelallvendor = async (req, res) => {
                try {
                    const projectId = req.session.projectId;
                const dateArray = JSON.parse(req.body.dateArray);
            
                console.log('Date Array:', dateArray);
            
                const productOrders = await e_products.find({projectId: projectId});
                console.log('Product Orders:', productOrders);
            
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Material Report');
            
                // Define the columns
                worksheet.columns = [
                    { header: 'Date', key: 'date' },
                    { header: 'Vendor', key: 'vendorName' },
                    { header: 'Address', key: 'address' },
                    { header: 'GST', key: 'gst' },
                    { header: 'Site', key: 'site' },
                    { header: 'Material', key: 'nameOfMaterial' },
                    { header: 'Unit', key: 'unit' },
                    { header: 'Used', key: 'used' },
                ];
            
                for (const order of productOrders) {
                    let includeRecord = true;
                    let formattedDate = '';
            
                    if (dateArray && dateArray.length > 0) {
                    includeRecord = false;
            
                    for (const selectedDate of dateArray) {
                        const selectedDateObj = new Date(selectedDate);
                        const orderDateObj = new Date(order.date);
            
                        if (
                        selectedDateObj.getFullYear() === orderDateObj.getFullYear() &&
                        selectedDateObj.getMonth() === orderDateObj.getMonth() &&
                        selectedDateObj.getDate() === orderDateObj.getDate()
                        ) {
                        includeRecord = true;
                        formattedDate = selectedDateObj.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });
                        break;
                        }
                    }
                    }
            
                    if (includeRecord && order.products && order.products.length > 0) {
                    for (const product of order.products) {
                        worksheet.addRow({
                        date: formattedDate,
                        vendorName: order.vendor.vendorName,
                        address: order.vendor.address,
                        gst: order.vendor.gst,
                        site: order.vendor.site,
                        nameOfMaterial: product.nameOfMaterial,
                        unit: product.unit,
                        used: product.used ? 'Yes' : 'No',
                        });
                    }
                    }
                }
            
                const buffer = await workbook.xlsx.writeBuffer();
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename="material_details.xlsx"');
                res.send(buffer);
                } catch (error) {
                console.error('Error generating Excel:', error);
                res.status(500).send('Error generating Excel');
                }
            };
        
        
            exports.downloadPDFallproduct = async (req, res) => {
                try {
                    const projectId = req.session.projectId;
                    const dateArray = JSON.parse(req.body.dateArray);
                
                    const productOrders = await e_products.find({projectId: projectId});
                
                    const doc = new PDFDocument();
                    res.setHeader('Content-Disposition', 'attachment; filename=material_details.pdf');
                    doc.pipe(res);
                
                    // Set font style for the document
                    doc.font('Helvetica-Bold');
                
                    doc.fontSize(18).text('Material Wise Details', { align: 'center' });
                    doc.moveDown();
                
                    // Define the table object here
                    const table = {
                        headers: ['Date', 'Vendor', 'Address', 'GST', 'Site', 'Material'],
                        rows: []
                    };
                
                    // Populate the table rows
                    productOrders.forEach(order => {
                        if (!dateArray || dateArray.length === 0) {
                        // If dateArray is null or empty, include all records
                        order.products.forEach(product => {
                            const orderDateObj = new Date(order.date);
                            const formattedDate = orderDateObj.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            });
                            const nameOfMaterial = product.nameOfMaterial;
                            const currentStock = product.currentStock;
                
                            table.rows.push([
                            formattedDate,
                            order.vendor.vendorName,
                            order.vendor.address,
                            order.vendor.gst,
                            order.vendor.site,
                            nameOfMaterial,
                            product.used,
                            currentStock
                            ]);
                        });
                        } else {
                        // If dateArray is not null, filter records based on date
                        dateArray.forEach(selectedDate => {
                            const selectedDateObj = new Date(selectedDate);
                            order.products.forEach(product => {
                            const orderDateObj = new Date(order.date);
                
                            if (
                                selectedDateObj.getFullYear() === orderDateObj.getFullYear() &&
                                selectedDateObj.getMonth() === orderDateObj.getMonth() &&
                                selectedDateObj.getDate() === orderDateObj.getDate()
                            ) {
                                const formattedDate = orderDateObj.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                });
                                const nameOfMaterial = product.nameOfMaterial;
                                const currentStock = product.currentStock;
                
                                table.rows.push([
                                formattedDate,
                                order.vendor.vendorName,
                                order.vendor.address,
                                order.vendor.gst,
                                order.vendor.site,
                                nameOfMaterial,
                                product.used,
                                currentStock
                                ]);
                            }
                            });
                        });
                        }
                    });
                
                    // Set font style for the table
                    doc.font('Helvetica');
                
                    const initialY = doc.y + 10; // Added padding
                    const columnWidth = 60; // Adjusted column width
                    const totalWidth = table.headers.length * columnWidth;
                
                    // Center the table horizontally
                    const initialX = (doc.page.width - totalWidth) / 2;
                
                    // Draw the table header
                    doc.fontSize(12).fillColor('#000');
                    table.headers.forEach((header, i) => {
                    doc.text(header, initialX + i * columnWidth, initialY, { width: columnWidth, align: 'center' });
                    });
                    doc.moveDown();
                
                    // Set the initial y position for the rows
                    const rowHeight = 25;
                    let currentY = doc.y;
                
                    // Draw the table rows
                    table.rows.forEach((row, i) => {
                    doc.fontSize(10).fillColor('#333');
                    row.forEach((text, j) => {
                        doc.text(text, initialX + j * columnWidth, currentY, { width: columnWidth, align: 'center' });
                    });
                    currentY += rowHeight;
                    doc.moveDown();
                    });
                
                    doc.end();
                
                    } catch (error) {
                    console.error('Error generating PDF:', error);
                    res.status(500).send('Error generating PDF');
                    }
                };
                
                
                
                
                exports.downloadExcelallproduct = async (req, res) => {
                try {
                    const projectId = req.session.projectId; 
                    const dateArray = JSON.parse(req.body.dateArray); // Parse the JSON string back to an array
                
                    console.log('Date Array:', dateArray);
                
                    const productOrders = await e_products.find({projectId: projectId});
                    console.log('Product Orders:', productOrders);
                
                    const workbook = new ExcelJS.Workbook();
                    const worksheet = workbook.addWorksheet('Material Report');
                
                    // Define the columns
                    worksheet.columns = [
                        { header: 'Date', key: 'date' },
                        { header: 'Vendor', key: 'vendorName' },
                        { header: 'Address', key: 'address' },
                        { header: 'GST', key: 'gst' },
                        { header: 'Site', key: 'site' },
                        { header: 'Material', key: 'nameOfMaterial' },
                        { header: 'Unit', key: 'unit' },
                    ];
                
                    for (const order of productOrders) {
                        let includeRecord = true;
                        let formattedDate = '';
                
                        if (dateArray && dateArray.length > 0) {
                        includeRecord = false;
                
                        for (const selectedDate of dateArray) {
                            const selectedDateObj = new Date(selectedDate);
                            const orderDateObj = new Date(order.date);
                
                            if (
                            selectedDateObj.getFullYear() === orderDateObj.getFullYear() &&
                            selectedDateObj.getMonth() === orderDateObj.getMonth() &&
                            selectedDateObj.getDate() === orderDateObj.getDate()
                            ) {
                            includeRecord = true;
                            formattedDate = selectedDateObj.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            });
                            break; // No need to check further dates
                            }
                        }
                        }
                
                        if (includeRecord) {
                        for (const product of order.products) {
                            // Add data to Excel worksheet
                            worksheet.addRow({
                            date: formattedDate,
                            vendorName: order.vendor.vendorName,
                            address: order.vendor.address,
                            gst: order.vendor.gst,
                            site: order.vendor.site,
                            nameOfMaterial: product.nameOfMaterial,
                            unit: product.unit,
                            used: product.used ? 'Yes' : 'No',
                            });
                
                        }
                        }
                    }
                
                    const buffer = await workbook.xlsx.writeBuffer();
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setHeader('Content-Disposition', 'attachment; filename="material_details.xlsx"');
                    res.send(buffer);
                } catch (error) {
                    console.error('Error generating Excel:', error);
                    res.status(500).send('Error generating Excel');
                }
                };