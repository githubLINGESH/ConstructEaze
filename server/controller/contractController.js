const contracts = require('../model/contractModel');
const path = require('path');


exports.getpage = async (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'conts.html'));
};

exports.getTasks = async (req, res) => {
  const searchQuery = req.query.search;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const role = req.session.role;
  const userId= req.session.userId;
  const projectId = req.session.projectId;

  let query = {};

  if (!searchQuery) {
    query = { date: today,projectId:projectId};
  } else {
    query = {
      $or: [
        { w_name: { $regex: new RegExp(searchQuery, 'i') }, date: today,projectId:projectId},
        { w_name: { $regex: new RegExp(searchQuery, 'i') }, date: null,projectId:projectId},
      ],
    };
  }

  try {
    const tasksToReturn = await contracts.find(query);
    console.log(tasksToReturn);

    res.status(200).json({tasks: tasksToReturn, role: role });
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).send('Error retrieving tasks.');
  }
};



exports.markAttendance = async (req, res) => {
  try {
    const { date, workerID, status, shift,latitude, longitude } = req.body;
    const userId = req.session.auth;
    const role  = req.session.role;
    const name = req.session.name;
    const projectId = req.session.projectId;
    
    console.log(date);

    const parsedShift = parseFloat(shift);

    console.log(parsedShift);
    // Get today's date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Find the contract in the database by worker name
    const contract = await contracts.findOne({ w_name: workerID, date: today });

    if (contract) {
      // If a document exists for today, update the "pa" field with the given status
      contract.shift=parsedShift;
      contract.name= name;
      contract.role = role;
      contract.pa = status;
      contract.projectId = projectId;
      console.log(contract.total);

      if (isNaN(contract.total)) {
        contract.total = 0;
      }

      contract.total = parsedShift*contract.sal;

      // Only update latitude and longitude if the role is 'supervisor'
      if (role === 'supervisor') {
        contract.latitude = latitude;
        contract.longitude = longitude;
      }

      await contract.save();

      return res.status(200).json({ message: 'Attendance updated successfully', contract});
    }
    else {
      // Create a new attendance record since it doesn't exist for today
      const originalContract = await contracts.findOne({ w_name: workerID , date:null});

      if (!originalContract) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      
      const shiftt = 1;

      const contractData = {
        projectId:projectId,
        userId:userId,
        name:name,
        role:role,
        w_name: workerID,
        w_type: originalContract.w_type,
        shift: shiftt,
        sal: originalContract.sal,
        phone: originalContract.phone,
        date: today,
        pa: status,
        latitude : originalContract.latitude,
        longitude : originalContract.longitude,
        total : parseInt(shiftt) * parseInt(originalContract.sal)

      };

      // Only add latitude and longitude to the contract data if the role is 'supervisor'
      if (role === 'supervisor') {
        contractData.latitude = latitude;
        contractData.longitude = longitude;
      }

      const contractt = new contracts(contractData);

      // Save the new attendance record
      await contractt.save();

      return res.status(200).json({ message: 'Attendance marked successfully', contractt });
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.attforrec = async (req,res) => {
  try {
    const { date, workerID, status,shift,latitude, longitude } = req.body;
    const userId = req.session.auth;
    const role  = req.session.role; // Assuming the user's role is stored in the session
    const name = req.session.name;
    const projectId = req.session.projectId;

    const parsedShift = parseFloat(shift);
    

    // Get today's date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Find the contract in the database by worker name
    const contract = await contracts.findOne({ w_name: workerID, date: today });

    if (contract) {
      // If a document exists for today, update the "pa" field with the given status
      contract.shift=parsedShift;
      contract.name = name;
      contract.projectId = projectId;
      contract.role= role;
      contract.pa = status;

      if (isNaN(contract.total)) {
        contract.total = 0;
      }

      contract.total = parsedShift*contract.sal;

      // Only update latitude and longitude if the role is 'supervisor'
      if (role === 'supervisor') {
        contract.latitude = latitude;
        contract.longitude = longitude;
      }

      await contract.save();

      return res.status(200).json({ message: 'Attendance updated successfully', contract});
    } else {
      // Create a new attendance record since it doesn't exist for today
      const originalContract = await contracts.findOne({ w_name: workerID , date:null});

      if (!originalContract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      const shiftt = 1;

      const contractData = {
        projectId:projectId,
        userId:userId,
        name:name,
        role:role,
        w_name: workerID,
        w_type: originalContract.w_type,
        shift: shiftt,
        sal: originalContract.sal,
        phone: originalContract.phone,
        date: today,
        pa: status,
        latitude : originalContract.latitude,
        longitude : originalContract.longitude,
        total : parseInt(shiftt)*parseInt(originalContract.sal)

      };

      // Only add latitude and longitude to the contract data if the role is 'supervisor'
      if (role === 'supervisor') {
        contractData.latitude = latitude;
        contractData.longitude = longitude;
      }

      const contractt = new contracts(contractData);

      // Save the new attendance record
      await contractt.save();

      return res.status(200).json({ message: 'Attendance marked successfully', contractt });
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getlabouratt = async (projectId) => {
  try {
  const labourattendance = await contracts.find({projectId : projectId});
  return labourattendance;
  } catch (error) {
  throw error;
  }
};

exports.autosearch = async (req, res) => {
  const query = req.query.term.toLowerCase();
  const userId = req.session.userId;
  const projectId = req.session.projectId;

  try {
    const suggestions = await contracts
      .find({
        w_name: { $regex: query, $options: 'i' },
        date: null,
        projectId : projectId
      })
      .select('w_name') // Select only the w_name field
      .limit(10); // Limit the number of suggestions to 10

    const suggestionList = suggestions.map(task => task.w_name);
    res.json(suggestionList);
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    res.status(500).send('Error fetching autocomplete suggestions.');
  }
};

exports.getworkertypecount = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const projectId = req.session.projectId;

    // Find unique worker types for today
    const uniqueWorkerTypes = await contracts.distinct('w_type', {
      date: { $gte: today },
      projectId:projectId
    });

    // Initialize an object to store counts for worker types
    const workerTypeCounts = {};

    // Calculate counts for each worker type
    for (const w_type of uniqueWorkerTypes) {
      const count = await contracts.countDocuments({
        date: { $gte: today },
        projectId:projectId,
        w_type: w_type,
      });
      workerTypeCounts[w_type] = count;
    }

    // Now, workerTypeCounts contains counts for each worker type for today
    res.status(200).json(workerTypeCounts);
  } catch (error) {
    console.error('Error fetching worker type counts:', error);
    res.status(500).send('Error fetching worker type counts');
  }
};


exports.attcount = async(req,res) =>{
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const presentCount = await contracts.countDocuments({ date: today, pa: 'Present' });
  const absentCount = await contracts.countDocuments({ date: today, pa: 'Absent' });

  res.status(200).json({ presentCount, absentCount });

}

  exports.totalwages = async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const projectId = req.session.projectId;

        // Query the database to find entries that match the date condition
        const totalWages = await contracts.aggregate([
            {
                $match: {
                    date: today,
                    projectId:projectId,

                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' },
                },
            },
        ]);

        // Check if any data was found
        if (totalWages.length > 0) {
            // The total wages for the given date
            const total = totalWages[0].total;
            
            return res.status(200).json({ total });
        } else {
            // No data found for the given date
            return res.status(404).json({ error: 'No data found for today' });
        }
    } catch (error) {
        console.error('Error retrieving total wages:', error);
        res.status(500).send('Error retrieving total wages.');
    }
};



