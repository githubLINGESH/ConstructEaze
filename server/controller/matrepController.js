const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const { getProductOrders } = require('../controller/prodController');



exports.downloadExcel = async (req, res) => {
  try {
    const dateArray = JSON.parse(req.body.dateArray); // Parse the JSON string back to an array
    const l = dateArray.length;

    console.log(dateArray);
    console.log(l);

    const productOrders = await getProductOrders();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Material Report');

    // Define the columns and add data
    worksheet.columns = [
      { header: 'Date', key: 'Date_o' },
      { header: 'Vendor', key: 'Vendor_name' },
      { header: 'Material', key: 'Name_of_Material' },
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

exports.downloadPDF = async (req, res) => {
  try {
    const dateArray = JSON.parse(req.body.dateArray); // Parse the JSON string back to an array
    const l = dateArray.length;

    console.log(dateArray);
    console.log(l);

    const productOrders = await getProductOrders();

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
        formattedDate, // Use the formatted date
        order.Vendor_name,
        order.Name_of_Material,
        order.Used,
        order.Current_stock,
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

  
const YourModel = require('../model/prodModel'); // Replace with the actual model for your data

async function fetchDataBetweenDates(startDate, endDate) {
  try {
    // Parse startDate and endDate to Date objects if needed
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Query the database to fetch data between the specified dates
    const filteredData = await YourModel.find({
      DateField: {
        $gte: startDateObj,
        $lte: endDateObj,
      },
    });

    return filteredData;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}


