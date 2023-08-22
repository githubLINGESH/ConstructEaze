
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Assuming you have a function to fetch the product order details from the database
const { getProductOrders } = require('../controller/prodController');

exports.downloadPDF = async (req, res) => {
  try {
    const productOrders = await getProductOrders();

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text('Product Order Details', { align: 'center' });
    doc.moveDown();

    const tableHeaders = ['Date', 'Vendor', 'Material', 'Required Quantity', 'Unit Price'];

    const table = {
      rows: [tableHeaders],
    };

    productOrders.forEach((order) => {
      table.rows.push([
        order.Date_o,
        order.Vendor_name,
        order.Name_of_Material,
        order.Required_quantity,
        order.Unit_prize,
      ]);
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
    const productOrders = await getProductOrders(); // Fetch the product orders from the database

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Product Orders');

    worksheet.columns = [
      { header: 'Date', key: 'Date_o' },
      { header: 'Vendor', key: 'Vendor_name' },
      { header: 'Material', key: 'Name_of_Material' },
      { header: 'Required Quantity', key: 'Required_quantity' },
      { header: 'Unit Price', key: 'Unit_prize' },
    ];

    productOrders.forEach((order) => {
      worksheet.addRow(order);
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

