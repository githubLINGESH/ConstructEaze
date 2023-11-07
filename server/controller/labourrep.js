
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
            formattedDate,
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
    exports.downloadExcelforlab = async (req, res) => {
        try {
            const dateArray = JSON.parse(req.body.dateArray);
            const l = dateArray.length;

            console.log(dateArray);
        
            const labourattendance = await getlabouratt();
        
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Labour Attendance');
        
            worksheet.columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Worker Name', key: 'w_name', width: 25 },
                { header: 'Worker Type', key: 'w_type', width: 25 },
                { header: 'Shift', key: 'shift', width: 15 },
                { header: 'Present/Absent', key: 'pa', width: 20 },
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
                    w_name: order.w_name,
                    w_type: order.w_type,
                    shift: order.shift,
                    pa: order.pa,
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
        
