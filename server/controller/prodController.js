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
    const tasks = await e_products.find({userId : userId, flag : true});
    res.status(200).json(tasks);
} catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).send('Error retrieving tasks.');
}
};

exports.gettableTasks = async (req, res) => {
    try {
        const tasks = await e_products.find({order:true});
        res.status(200).json(tasks);
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

    
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Assuming you have a function to fetch the product order details from the database


exports.downloadPDF = async (req, res) => {
  const userId = req.session.auth;
  try {
    const productOrders = await e_products.find({userId:userId, order:true});

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text('PRODUCT ORDER DETAILS', { align: 'center' });
    doc.moveDown();

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

    const tableTop = doc.y + 15;
    const initialX = 110;
    const rowHeight = 25;
    const columnWidth = 100;

    for (let i = 0; i < table.rows.length; i++) {
      const currentRow = table.rows[i];
      for (let j = 0; j < currentRow.length; j++) {
        doc
          .fontSize(10)
          .text(currentRow[j], initialX + j * columnWidth, tableTop + i * rowHeight+8, {
            width: columnWidth,
            align: 'center', // Center-align the text horizontally
            valign: 'center', // Center-align the text vertically
          });
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
