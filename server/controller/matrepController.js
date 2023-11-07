
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Assuming you have a function to fetch the product order details from the database
const { getProductOrders } = require('../controller/prodController');

exports.downloadPDF = async (req, res) => {
  try {
    const productName = req.params.productName;
    const dateArray = JSON.parse(req.body.dateArray); // Parse the JSON string back to an array

    const productOrders = await getProductOrders(productName); // Fetch details from the database

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
      dateArray.forEach(selectedDate => {
        const selectedDateObj = new Date(selectedDate);
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

          // Add rows to the table
          order.products.forEach(product => {
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
      });
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



exports.downloadExcel = async (req, res) => {
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
      { header: 'Used', key: 'used' },
    ];

    for (const order of productOrders) {
      for (const selectedDate of dateArray) {
        const selectedDateObj = new Date(selectedDate);
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

          for (const product of order.products) {
            worksheet.addRow({
              date: formattedDate,
              vendorName: order.vendor.vendorName,
              address: order.vendor.address,
              gst: order.vendor.gst,
              site: order.vendor.site,
              nameOfMaterial: product.nameOfMaterial,
              unit: product.unit,
              used: product.used ? 'Yes' : 'No', // Assuming 'used' is a boolean
            });
          }
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
