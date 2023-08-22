const E_client = require('../model/clientModel');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

exports.getpage = async(req,res) => {
  res.sendFile(path.join(__dirname, '..', '..','clientf.html'));
};


exports.submitTask = async (req, res) => {
  const { name, phone, address } = req.body;

  try {
      const record = new E_client({
          name: name,
          phone: phone,
          address: address,
      });

      await record.save();
      console.log('Record inserted successfully.');

      res.status(200).send('Record inserted successfully.');
  } catch (error) {
      console.error('Error inserting record:', error);
      res.status(500).send('Error inserting record.');
  }
};

exports.handleFileUpload = (req, res) => {
  const file = req.file;

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

      // Map data to MongoDB worker documents
      const workers = results.map((result) => ({
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

