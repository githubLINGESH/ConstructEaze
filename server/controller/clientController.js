const E_client = require('../model/clientModel');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

exports.getpage = async(req,res) => {
  res.sendFile(path.join(__dirname, '..', '..','clientf.html'));
};


exports.submitTask = async (req, res) => {
  const { name, phone, address } = req.body;
  const userId = req.session.auth;
  const role = req.session.role;
  const projectId = req.session.projectId;

  try {
      const record = new E_client({
          projectId:projectId,
          userId:userId,
          role:role,
          name: name,
          phone: phone,
          address: address,
      });

      await record.save();
      console.log('Record inserted successfully.');

      res.status(200).json({ role: role });
  } catch (error) {
      console.error('Error inserting record:', error);
      res.status(500).send('Error inserting record.');
  }
};

exports.handleFileUpload = (req, res) => {
  const file = req.file;
  const userId = req.session.auth;
  const role = req.session.role;
  const projectId = req.session.projectId;

  if (!file) {
    return res.status(400).send('No file uploaded');
  }

  const results = [];

  // Parse CSV file
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Remove the temporary file
      fs.unlinkSync(file.path);

      console.log(encodeURIComponent(results[0]));

      // Map data to MongoDB worker documents
      const workers = results.map((result) => ({
        projectId: projectId,
        userId:userId,
        role:role,
        name: result.name,
        phone: parseInt(result.phone),
        address: result.address,
      }));

      // Save worker documents to MongoDB
      E_client.insertMany(workers)
        .then(() => {
          res.send('Data imported successfully');
        })
        .catch((error) => {
          res.status(500).send('Error importing data');
        });
    });
};


exports.Payment = async (req, res) => {
  try {
    const projectId = req.session.projectId;
    const { name, date, amt, C_As, C_By } = req.body;
    console.log(C_As,C_By,amt,name);

    let payment = await E_client.findOne({ projectId: projectId, name: name });

    if (payment) {
      // Check if the found document has the save method
      if (typeof payment.save === 'function') {
        payment.projectId = projectId,
        payment.name = name
        payment.C_As = C_As;
        payment.C_By = C_By;
        payment.dateOfPayment = date;
        payment.Amount = amt;

        await payment.save();

        res.status(200).send({ message: 'Payment inserted successfully' });
      } else {
        res.status(500).send({ error: 'Found document does not have a save method' });
      }
    } else {
      // Handle the case where no payment is found
      res.status(404).send({ message: 'Payment not found' });
    }
  } catch (error) {
    console.error('Error inserting payments', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};



exports.getClientDet = async(clientName,projectId) =>{
  try{
  if(clientName){
  tasks =  await E_client.findOne({projectId:projectId, name: clientName})
  }
  else{
  tasks = await E_client.find({projectId:projectId})
  }
  
  console.log("client payment details:",tasks);
  return tasks;
  }
  catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).send('Error retrieving tasks.');
}
};



