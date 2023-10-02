
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Assuming you have a function to fetch the product order details from the database
const { getVendorDetails } = require('../controller/prodController');

exports.downloadPDF = async (req, res) => {
  try {
    const vendorName = req.params.vendorName;
    const dateArray = JSON.parse(req.body.dateArray); // Parse the JSON string back to an array
    const l = dateArray.length;

    console.log(dateArray);
    console.log(l);

    const productOrders = await getVendorDetails(vendorName);

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text('Material Wise Details', { align: 'center' });
    doc.moveDown();

    const tableHeaders = ['Date', 'Vendor', 'Material', 'Used', 'Current Stock'];

    const table = {
      rows: [tableHeaders],
    };

    
productOrders.forEach((order) => {
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

      table.rows.push([
        formattedDate,
        order.Date_i, // Use the formatted date
        order.Vendor_name,
        order.Name_of_Material,
        order.Used,
        order.Current_stock,
        order.Unit
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
exports.downloadExcel= async (req, res) => {
  try {
    vendorName = req.params.vendorName;
    const dateArray = JSON.parse(req.body.dateArray); // Parse the JSON string back to an array
    const l = dateArray.length;

    console.log(dateArray);
    console.log(l);

    const productOrders = await getVendorDetails(vendorName);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Material Report');

    // Define the columns and add data
    worksheet.columns = [
      { header: 'Date', key: 'Date_o' },
      { header: 'Vendor', key: 'Vendor_name' },
      { header: 'Material', key: 'Name_of_Material' },
      { header: 'Unit' ,key:'Unit'},
      { header: 'Used', key: 'Used' },
      { header: 'Current Stock', key: 'Current_stock' },
    ];

    productOrders.forEach((order) => {
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
            Date_o: formattedDate, // Use the formatted date
            Vendor_name: order.Vendor_name,
            Name_of_Material: order.Name_of_Material,
            Unit:order.Unit,
            Used: order.Used,
            Current_stock: order.Current_stock,
          });
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