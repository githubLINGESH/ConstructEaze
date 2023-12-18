const WorkDone = require('../model/workModel');

// Create a new work done entry
exports.createWorkDone = async (req, res) => {
  try {
    const {workName,workdone, date ,labour , quantity , unit} = req.body;
    const projectId = req.session.projectId;

    const newWorkDone = new WorkDone({
      workName,
      projectId,
      workdone,
      date,
      labour,
      quantity,
      unit
    });

    const savedWorkDone = await newWorkDone.save();
    res.status(201).json(savedWorkDone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating work done entry' });
  }
};

// Get a list of work done entries
exports.getWorkDoneList = async (req, res) => {
  try {
    const projectId = req.session.projectId;
    const workDoneList = await WorkDone.find({projectId:projectId});
    console.log(workDoneList)
    res.status(200).json(workDoneList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching work done entries' });
  }
};

exports.deleteWork = async(req,res) =>{
  try{
    const projectId = req.session.projectId;
    const workName = req.body.workName;

    await WorkDone.deleteOne({projectId :projectId,workName:workName})
    res.status(200).send("Work deleted successful")
  }
  catch(error){
    res.status(500).send("Worker deletion error",error)
  }
}

const PDFDocument = require('pdfkit');

exports.downloadPDF = async (req, res) => {
  try {
    console.log("comes here");
    const projectId = req.session.projectId;

      const productOrders = await WorkDone.find({projectId:projectId});

      const doc = new PDFDocument();
      res.setHeader('Content-Disposition', 'attachment; filename=workDone_details.pdf');
      doc.pipe(res);

      doc.fontSize(18).text('Material Wise Details', { align: 'center' });
      doc.moveDown();

      // Define the table object here
      const table = {
      headers: ['Date', 'work Name', 'WorkDone','Quantity','Unit','labour'],
      rows: []
      };

      // Loop through each order and product
      productOrders.forEach(order => {
          const orderDate = new Date(order.date);
          const formattedSDate = orderDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          });
      
          table.rows.push([
              formattedSDate,
              order.workName,
              order.workdone,
              order.labour,
              order.quantity,
              order.unit,
          ]);
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
