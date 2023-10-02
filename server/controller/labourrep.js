
    const PDFDocument = require('pdfkit');
    const ExcelJS = require('exceljs');

    // Assuming you have a function to fetch the product order details from the database
    const { getlabouratt } = require('../controller/contractController');

    exports.downloadPDFforlab = async (req, res) => {
    try {
        const dateArray = JSON.parse(req.body.dateArray); // Parse the JSON string back to an array
        const l = dateArray.length;
    
        console.log(dateArray);
        console.log(l);

        const labourattendance = await getlabouratt();

        const doc = new PDFDocument();
        doc.pipe(res);

        doc.fontSize(18).text('Labour Attendance Details', { align: 'center' });
        doc.moveDown();

        const tableHeaders = ['date','w_name','w_type','shift','present/absent'];

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
            order.date,
            order.w_name,
            order.w_type,
            order.shift,
            order.pa,
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
    exports.downloadExcelforlab= async (req, res) => {
    try {

        const dateArray = JSON.parse(req.body.dateArray); // Parse the JSON string back to an array
        const l = dateArray.length;
    
        console.log(dateArray);
        console.log(l);

        const labourattendance = await getlabouratt(); // Fetch the product orders from the database

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Labour Attendance');

        worksheet.columns = [
        { header: 'w_name', key: 'w_name' },
        { header: 'w_type', key: 'w_type' },
        { header: 'shift', key: 'shift' },
        { header: 'present/Absent', key: 'pa' },
        ];

        labourattendance.forEach((order) => {
            for (let i = 0; i < l; i++) {
                const selectedDate = dateArray[i];
        
                // Parse the date strings to Date objects
                const selectedDateObj = new Date(selectedDate);
                    const orderDateObj = new Date(order.Date_o);
            
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
        worksheet.addRow({
            date: formattedDate,
            w_name:order.w_name,
            type:order.w_type,
            shift:order.shift,
            pa:order.pa,

        })
    }
}
});
    


        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=product_orders.xlsx');
        res.send(buffer);
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).send('Error generating Excel');
    }
    };

