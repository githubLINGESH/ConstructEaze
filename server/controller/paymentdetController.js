const lpay = require('../model/labourpayModel');
const vpay = require('../model/vendorpayModel');
const path = require('path')
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

exports.page = (req, res) => {
res.sendFile(path.join(__dirname, '..','..', 'totexp.html'));
};

exports.submitven = async (req, res) => {
const {date,name,quantity,unit,unitprice,amt} = req.body;
const userId = req.session.auth;
const role = req.session.role;
const projectId = req.session.projectId;

console.log(date)

try {
    const record = new vpay({
    projectId:projectId,
    userId:userId,
    role:role,
    date:date,
    name:name,
    quantity : quantity,
    unit:unit,
    unitPrice:unitprice,
    Amount:amt
    });

    await record.save();
    console.log('Record inserted successfully.');

    res.status(200).send('Record inserted successfully.');
} catch (error) {
    console.error('Error inserting record:', error);
    res.status(500).send('Error inserting record.');
}
};


exports.submitlab = async (req, res) => {
    const { date , name , amt} = req.body;
    const userId = req.session.auth;
    const role = req.session.role;
    const projectId = req.session.projectId;
    try {
        const record = new lpay({
        projectId:projectId,
        userId:userId,
        role:role,
        date : date,
        name : name ,
        Amount : amt,
        });
    
        await record.save();
        console.log('Record inserted successfully.');
    
        res.status(200).send('Record inserted successfully.');
    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
    }
    };


    exports.getVendorNames = async (req, res) => {
        try {
            const projectId = req.session.projectId;
    
            const vendorNames = await vpay.distinct('name', { projectId: projectId });
            res.json(vendorNames);
            } catch (error) {
            console.error('Error fetching vendor names:', error);
            res.status(500).json({ message: 'Internal server error' });
            }
        };
        
    
    exports.getLabourNames = async (req, res) => {
        try {
    
            const projectId = req.session.projectId;
            const productNames = await lpay.find({ 'projectId': projectId }).distinct("name");
            res.json(productNames);
        } catch (error) {
            console.error('Error fetching product names:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };


    exports.getVendorDet = async (vendorName) => {
        try {
            const projectId = req.session.projectId;
          // Use the provided vendorName parameter to filter vendor details
            const vendorDetails = await vpay.find({ name : vendorName },{projectId : projectId});
            return vendorDetails;
            } catch (error) {
            console.error('Error fetching vendor details:', error);
            throw error; // Re-throw the error to handle it in the calling function
            }
        };

        exports.getLabourDet = async (labourName) => {
            try {
                const projectId = req.session.projectId;
              // Use the provided vendorName parameter to filter vendor details
                const labourDetails = await lpay.find({ name : labourName },{projectId : projectId});
                return labourDetails;
                } catch (error) {
                console.error('Error fetching vendor details:', error);
                throw error; // Re-throw the error to handle it in the calling function
                }
            };

            const { getVendorDet,getLabourDet} = require('../controller/paymentdetController');

            exports.getVendorDetailsPDF = async (req, res) => {
                try {
                    const vendorName = req.params.vendorName;
                    const dateArray = JSON.parse(req.body.dateArray);
                    const l = dateArray.length;
                
                    console.log(dateArray);
                    console.log(l);
            
                    const labourattendance = await getVendorDet(vendorName);
            
                    const doc = new PDFDocument();
                    doc.pipe(res);
            
                    doc.fontSize(18).text('Vendor Payment Details', { align: 'center' });
                    doc.moveDown();
            
                    const tableHeaders = ['dateOfPayment','name','quantity','unit','unit price','Amount'];
            
                    const table = {
                    rows: [tableHeaders],
                    };
                    labourattendance.forEach((order) => {
                        for (let i = 0; i < l; i++) {
                        const selectedDate = dateArray[i];
            
                    // Parse the date strings to Date objects
                    const selectedDateObj = new Date(selectedDate);
                    const orderDateObj = new Date(order.date);
            
                    // Compare the date parts (year, month, and day)
                    if (
                    selectedDateObj.getFullYear() === orderDateObj.getFullYear() &&
                    selectedDateObj.getMonth() === orderDateObj.getMonth() &&
                    selectedDateObj.getDate() === orderDateObj.getDate()
                    ) {
                    // Format the date without the time portion
                    const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    });
            
                    table.rows.push([
                        formattedDate,
                        order.name,
                        order.quantity,
                        order.unit,
                        order.unitPrice,
                        order.Amount
                    ]);
                }
            }
            });
            
                    const tableTop = doc.y + 15;
                    const initialX = 50;
                    const rowHeight = 25;
                    const columnWidth = 100;
            
                    for (let i = 0; i < table.rows.length; i++) {
                    const currentRow = table.rows[i];
                    for (let j = 0; j < currentRow.length; j++) {
                        doc
                        .fontSize(12)
                        .text(currentRow[j], initialX + j * columnWidth, tableTop + i * rowHeight, { width: columnWidth });
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
            
                // Route to generate and download the Excel file
                exports.getVendorDetailsExcel = async (req, res) => {
                    try {
                        
                        const vendorName = req.params.vendorName;
                        const dateArray = JSON.parse(req.body.dateArray);
                        const l = dateArray.length;
            
                        console.log(dateArray);
                    
                        const labourattendance = await getVendorDet(vendorName);
                    
                        const workbook = new ExcelJS.Workbook();
                        const worksheet = workbook.addWorksheet('Labour Attendance');
                    
                        worksheet.columns = [
                            { header: 'DateOfPayment', key: 'date', width: 15 },
                            { header: 'Vendor Name', key: 'name', width: 25 },
                            { header: 'quantity', key: 'quantity', width: 25 },
                            { header: 'Unit', key: 'unit', width: 15 },
                            { header: 'UnitPrice', key: 'unitPrice', width: 20 },
                            { header: 'Amount', key: 'Amount', width: 20 },
                        ];
                    
                        labourattendance.forEach((order) => {
                            for (let i = 0; i < l; i++) {
                            const selectedDate = dateArray[i];
                            const selectedDateObj = new Date(selectedDate);
                            const orderDateObj = new Date(order.date); // Make sure 'date' is the correct field name
                    
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
                    
                                worksheet.addRow({
                                date: formattedDate,
                                name: order.w_name,
                                quantity: order.quantity,
                                unit: order.unit,
                                unitPrice: order.unitPrice,
                                Amount : order.Amount
                                });
                            }
                            }
                        });
                    
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader('Content-Disposition', 'attachment; filename="Labour_Attendance.xlsx"');
                        await workbook.xlsx.write(res); // Directly write to the response stream
                        res.end();
                        } catch (error) {
                        console.error('Error generating Excel:', error);
                        res.status(500).send('Error generating Excel');
                        }
                    };


                    exports.getLabDetailsPDF = async (req, res) => {
                        try {
                            const labourName = req.params.labourName;
                            const dateArray = JSON.parse(req.body.dateArray); // Parse the JSON string back to an array
                            const l = dateArray.length;
                        
                            console.log(dateArray);
                            console.log(l);
                    
                            const labourattendance = await getLabourDet(labourName);
                    
                            const doc = new PDFDocument();
                            doc.pipe(res);
                    
                            doc.fontSize(18).text('Labour Attendance Details', { align: 'center' });
                            doc.moveDown();
                    
                            const tableHeaders = ['dateOfPayment','name','Amount'];
                    
                            const table = {
                            rows: [tableHeaders],
                            };
                    
                            labourattendance.forEach((order) => {
                                for (let i = 0; i < l; i++) {
                                const selectedDate = dateArray[i];
                    
                            // Parse the date strings to Date objects
                            const selectedDateObj = new Date(selectedDate);
                            const orderDateObj = new Date(order.date);
                    
                            // Compare the date parts (year, month, and day)
                            if (
                            selectedDateObj.getFullYear() === orderDateObj.getFullYear() &&
                            selectedDateObj.getMonth() === orderDateObj.getMonth() &&
                            selectedDateObj.getDate() === orderDateObj.getDate()
                            ) {
                            // Format the date without the time portion
                            const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            });
                    
                            table.rows.push([
                                formattedDate,
                                order.name,
                                order.Amount,
                            ]);
                        }
                    }
                    });
                    
                            const tableTop = doc.y + 15;
                            const initialX = 50;
                            const rowHeight = 25;
                            const columnWidth = 100;
                    
                            for (let i = 0; i < table.rows.length; i++) {
                            const currentRow = table.rows[i];
                            for (let j = 0; j < currentRow.length; j++) {
                                doc
                                .fontSize(12)
                                .text(currentRow[j], initialX + j * columnWidth, tableTop + i * rowHeight, { width: columnWidth });
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
                    
                        // Route to generate and download the Excel file
                        exports.getLabDetailsExcel = async (req, res) => {
                            try {
                                const labourName = req.params.labourName;
                                const dateArray = JSON.parse(req.body.dateArray);
                                const l = dateArray.length;
                    
                                console.log(dateArray);
                            
                                const labourattendance = await getLabourDet(labourName);
                            
                                const workbook = new ExcelJS.Workbook();
                                const worksheet = workbook.addWorksheet('Labour Attendance');
                            
                                worksheet.columns = [
                                    { header: 'Date of Payment', key: 'date', width: 15 },
                                    { header: 'Labour Name', key: 'name', width: 25 },
                                    { header: 'Amount', key: 'w_type', width: 25 },
                                ];
                            
                                labourattendance.forEach((order) => {
                                    for (let i = 0; i < l; i++) {
                                    const selectedDate = dateArray[i];
                                    const selectedDateObj = new Date(selectedDate);
                                    const orderDateObj = new Date(order.date); // Make sure 'date' is the correct field name
                            
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
                            
                                        worksheet.addRow({
                                        date: formattedDate,
                                        name: order.name,
                                        Amount: order.Amount,
                                        });
                                    }
                                    }
                                });
                            
                                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                                res.setHeader('Content-Disposition', 'attachment; filename="Labour_Attendance.xlsx"');
                                await workbook.xlsx.write(res); // Directly write to the response stream
                                res.end();
                                } catch (error) {
                                console.error('Error generating Excel:', error);
                                res.status(500).send('Error generating Excel');
                                }
                            };