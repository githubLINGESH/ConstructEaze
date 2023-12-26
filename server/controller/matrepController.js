
  const PDFDocument = require('pdfkit');
  const ExcelJS = require('exceljs');

  const { getProductOrders } = require('../controller/prodController');

  exports.downloadPDF = async (req, res) => {
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
  
      // Now you can generate the table as you intended
      const initialY = doc.y + 10; // Added padding
      const columnWidth = 80; // Adjusted column width
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
