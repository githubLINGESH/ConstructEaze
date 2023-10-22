const path = require('path');
const e_products = require('../model/prodModel');
const e_projects = require('../model/projectModel');


exports.getProductPage = (req, res) => {
res.sendFile(path.join(__dirname, '..', '..', 'prod.html'));
};

// Define a PurchaseOrder model and import it

exports.generatePNo = async (req, res) => {
  const projectId = req.session.projectId;

  try {
    // Find the max purchase order number for the given projectId
    const maxPurchaseOrder = await e_products.findOne({ projectId })
      .sort({ purchaseOrderNo: -1 })
      .limit(1);

    // Check if maxPurchaseOrder is null (no existing purchase order for the projectId)
    if (!maxPurchaseOrder) {
      // If no purchase order found, set the purchase order number to 1
      res.status(200).json({ purchaseOrderNo: 0 });
    } else {
      // If purchase order found, increment the purchase order number by 1
      const newPurchaseOrderNo = parseInt(maxPurchaseOrder.purchaseOrderNo) + 1;
      res.status(200).json({ purchaseOrderNo: newPurchaseOrderNo });
    }
  } catch (error) {
    console.error('Error fetching max purchase order number:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.submitMaterial = async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const projectId = req.session.projectId;
    const purchaseOrderNo = req.body.purchaseOrderNo;
    const vendorName = req.body.vendorName;
    const address = req.body.address;
    const gst = req.body.gst;
    const phone = req.body.phone;
    const site = req.body.shippedToSite;

    // Convert the JSON string of products back to an array
    const products = req.body.products;

    // Check if a document with the same purchaseOrderNo and vendorName exists
    const existingPurchaseOrder = await e_products.findOne({
      'projectId':projectId,
      'purchaseOrderNo': null,
      'vendor.vendorName': vendorName,
    });

    if (existingPurchaseOrder) {
      // Create a new PurchaseOrder document with the same vendor information
      const newPurchaseOrder = new e_products({
        projectId: projectId,
        purchaseOrderNo: purchaseOrderNo,
        vendor: existingPurchaseOrder.vendor, // Use the vendor information from the existing document
        products: products,
      });

      // Save the new purchase order document to the database
      await newPurchaseOrder.save();

      res.status(201).json(newPurchaseOrder);
    } else {
      // Create a new PurchaseOrder document with the provided vendor information
      const newPurchaseOrder = new e_products({
        date:today,
        projectId:projectId,
        purchaseOrderNo: purchaseOrderNo,
        vendor: {
          vendorName: vendorName,
          address: address,
          gst: gst,
          phone: phone,
          site : site,
        },
        products: products,
      });

      // Save the new purchase order document to the database
      await newPurchaseOrder.save();

      res.status(201).json(newPurchaseOrder);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send('Error occurred while saving the purchase order.');
  }
};


  exports.getVendor = async (req, res) => {
    const vendorName = req.params.vendorName;
    const userId = req.session.userId;
  
    try {
      const vendorDocument = await e_products.findOne({
        'vendor.vendorName': vendorName,
      });
  
      if (vendorDocument) {
        const add = vendorDocument.vendor.address;
        const gst = vendorDocument.vendor.gst;
        const projectDocument = await e_projects.findOne({ userId: userId });

        if (projectDocument) {
          const projectName = projectDocument.Project_name;
          res.status(200).json({ add, gst, projectName });
        } else {
          res.status(404).json({ message: 'Project not found' });
        }
      } else {
        
        res.status(404).json({ message: 'Vendor not found' });
      }
    } catch (error) {
      console.error('Error retrieving vendor and project information:', error);
      res.status(500).json({ message: 'Error retrieving vendor and project information' });
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
