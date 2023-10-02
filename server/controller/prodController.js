const path = require('path');
const e_products = require('../model/prodModel');


exports.getProductPage = (req, res) => {
res.sendFile(path.join(__dirname, '..', '..', 'prod.html'));
};

exports.submitMaterial = async (req, res) => {

  const userId = req.session.auth;
  const role = req.session.role;

      const {
        Date_o,
        Vendor_name,
        Name_of_Material,
        Required_quantity,
      } = req.body;
      
      console.log('Vendor_name:', Vendor_name);
      console.log('Name_of_Material:', Name_of_Material);

  
      const materialInward = await e_products.findOne({ Vendor_name, Name_of_Material });
  
      if (!materialInward) {
        return res.status(404).json({ error: 'Material not found' });
      }
      const firm_name = materialInward.Firmname;
      const address = materialInward.Address;
      const Gst =materialInward.Gst;
      const phone=materialInward.Phone;
      const Item_code=materialInward.Item_code;
      const category=materialInward.Category;
      const unit=materialInward.Unit;

      
      try {
        const record = new e_products({
          //id: Number,
          userId:userId,
          Date_o: Date_o ,
          Date_i:null ,
          Date_u: null,
          flag: false,
          order: true,
          Vendor_name: Vendor_name,
          Firmname: firm_name,
          Address: address,
          Gst: Gst,
          Phone: phone,
          Item_code : Item_code,
          Name_of_Material: Name_of_Material,
          Category: category,
          Unit: unit,
          Unit_prize:null,
          Required_quantity: Required_quantity,
          Supplied_quantity: 0,
          Used: 0,
          Current_stock: 0,
          Price: null
      });
      await record.save();
      return res.status(200).json({ message: 'material submitted successfully'});
    } catch (error) {
      console.error('Error updating record:', error);
      res.status(500).send('Error updating record.');
    }
  };


exports.getTasks = async (req, res) => {
  const userId = req.session.auth;

try {
    const tasks = await e_products.find({flag : true});
    res.status(200).json(tasks);
} catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).send('Error retrieving tasks.');
}
};

exports.gettableTasks = async (vendorName,res) => {
    try {
        const tasks = await e_products.find({Vendor_name:vendorName, order:true});
        return tasks;
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).send('Error retrieving tasks.');
    }
    };

    exports.getProductOrders = async () => {
        try {
        const productOrders = await e_products.find();
        return productOrders;
        } catch (error) {
        throw error;
        }
    };
    
    // Function to add a new product order to the database
    exports.addProductOrder = async (productOrderData) => {
        try {
        // Perform any data validation or processing if needed
        const newProductOrder = new e_products(productOrderData);
        await newProductOrder.save();
        } catch (error) {
        throw error;
        }
    };

    exports.autosearchforprod = async (req, res) => {
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



    exports.getVendorDetails = async (vendorName) => {
      try {
        // Use the provided vendorName parameter to filter vendor details
        const vendorDetails = await e_products.find({ Vendor_name: vendorName });
        return vendorDetails;
      } catch (error) {
        console.error('Error fetching vendor details:', error);
        throw error; // Re-throw the error to handle it in the calling function
      }
    };



    const PDFDocument = require('pdfkit');
    const ExcelJS = require('exceljs');
    
    const { gettableTasks } = require('../controller/prodController');
    
    exports.downloadPDF = async (req, res) => {
      const userId = req.session.auth;
      try {
        const vendorName = req.params.vendorName;
        const productOrders = await gettableTasks(vendorName);
    
        const doc = new PDFDocument();
        doc.pipe(res);
    
        // Define page dimensions
        const pageWidth = 612; // 8.5 inches converted to points
        const pageHeight = 792; // 11 inches converted to points
    
        // Define box coordinates and dimensions
        const boxMargin = 20;
        const boxWidth = pageWidth - 2 * boxMargin;
        const boxHeight = 60;
        const boxPadding = 10;
        const backgroundColor = '#242e82'; // Dark blue background color
        const textColor = '#ffffff';
    
        // Center align boxes on the page
        const boxX = (pageWidth - boxWidth) / 2;
    
        // Add Border Box for Company Header
        doc.rect(boxX, boxMargin, boxWidth, boxHeight).fill(backgroundColor).stroke();
        doc.fontSize(24).fillColor(textColor).text('Company Name', boxX, boxMargin + 10, { width: boxWidth, align: 'center' });
        doc.fontSize(10).fillColor(textColor).text('Company Address', boxX+boxPadding, boxMargin + 30,{
          width: boxWidth - 2 * boxPadding,
          align: 'center',
        });
        doc.moveDown();
    
        // Add Vendor Details
        doc.fill(backgroundColor).text('Vendor Name:', boxX+ boxPadding, boxMargin + boxHeight + 10, { continued: true, width: 200, align: 'left' });
        doc.text(vendorName, boxX + boxPadding, boxMargin + boxHeight + 10, { width: 200, align: 'left' });
        doc.text('Date:', boxX + 400, boxMargin + boxHeight + 10, { width: 200, align: 'left' });
        doc.text('Purchase Order Number:', boxX+boxPadding, boxMargin + boxHeight + 30, { continued: true, width: 200, align: 'left' });
        doc.text('PO-12345', boxX + boxPadding, boxMargin + boxHeight + 30, { width: 200, align: 'left' });
        doc.moveDown();
    
        // Calculate table dimensions and center the table
        const tableHeaders = ['DATE', 'VENDOR', 'MATERIAL', 'REQUIRED'];
        const table = {
          rows: [tableHeaders],
        };
    
        productOrders.forEach((order) => {
          table.rows.push([
            order.Date_o,
            order.Vendor_name,
            order.Name_of_Material,
            order.Required_quantity,
          ]);
        });
    
        const tableTop = boxMargin + boxHeight + 60;
        const tableBottom = tableTop + table.rows.length * 25; // Assuming row height is 25
        const tableHeight = tableBottom - tableTop;
        const initialX = (pageWidth - tableHeaders.length * 100) / 2; // Center align the table
    
        // Add Border Box for Table
        doc.rect(initialX - 5, tableTop - 5, tableHeaders.length * 100 + 10, tableHeight + 10).stroke();
    
        // Add Table Headers and Data
        for (let i = 0; i < table.rows.length; i++) {
          const currentRow = table.rows[i];
          for (let j = 0; j < currentRow.length; j++) {
            doc
              .fontSize(10)
              .text(currentRow[j], initialX + j * 100, tableTop + i * 25 + 8, {
                width: 100,
                align: 'center',
                valign: 'center',
              });
          }
        }
    
        // Calculate Subtotal, Tax, and Grand Total
        const subtotal = productOrders.reduce((sum, order) => sum + order.Required_quantity, 0);
        const tax = subtotal * 0.1; // Assuming 10% tax, adjust as needed
        const grandTotal = subtotal + tax;
    
        // Add Border Box for Subtotal, Tax, and Grand Total
        const boxSubtotalX = boxX + 50; // Adjust as needed
        const boxSubtotalY = tableBottom + 20; // Adjust as needed
        const boxSubtotalWidth = boxWidth - 100; // Adjust as needed
        const boxSubtotalHeight = 60; // Adjust as needed
    
        doc.rect(boxSubtotalX, boxSubtotalY, boxSubtotalWidth, boxSubtotalHeight).stroke();
        doc.text(`Subtotal: ${subtotal}`, boxSubtotalX + 10, boxSubtotalY + 10, { width: boxSubtotalWidth - 20, align: 'left' });
        doc.text(`Tax (10%): ${tax}`, boxSubtotalX + 10, boxSubtotalY + 30, { width: boxSubtotalWidth - 20, align: 'left' });
        doc.text(`Grand Total: ${grandTotal}`, boxSubtotalX + 10, boxSubtotalY + 50, { width: boxSubtotalWidth - 20, align: 'left' });
    
        // Add Signature Boxes for APC and Vendor
        const boxSignatureWidth = (boxWidth - 30) / 2;
        const boxSignatureHeight = 60;
        const boxSignatureY = boxSubtotalY + boxSubtotalHeight + 20;
    
        // APC Signature Box
        doc.rect(boxX + 10, boxSignatureY, boxSignatureWidth, boxSignatureHeight).stroke();
        doc.text('APC Associates', boxX + 20, boxSignatureY + 10, { width: boxSignatureWidth - 20, align: 'left' });
    
        // Vendor Signature Box
        doc.rect(boxX + boxSignatureWidth + 20, boxSignatureY, boxSignatureWidth, boxSignatureHeight).stroke();
        doc.text('Vendor Signature', boxX + boxSignatureWidth + 30, boxSignatureY + 10, { width: boxSignatureWidth - 20, align: 'left' });
    
        doc.end();
      } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
      }
    };
    
    

// Route to generate and download the Excel file
/*exports.downloadExcel= async (req, res) => {
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
*/
