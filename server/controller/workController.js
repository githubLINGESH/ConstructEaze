const WorkDone = require('../model/workModel');

// Create a new work done entry
exports.createWorkDone = async (req, res) => {
  try {
    const {workdone, date } = req.body;
    const projectId = req.session.projectId;

    const newWorkDone = new WorkDone({
      projectId,
      workdone,
      date,
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