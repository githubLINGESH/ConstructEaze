const express = require('express');
const router = express.Router();
const { submitproj, getpag } = require('../controller/projectController');
const e_projects = require('../model/projectModel');

router.get('/',getpag);
router.post('/submitproj', submitproj);
router.get('/getprojects', async (req, res) => {
    try {
      const projects = await e_projects.find();
      res.status(200).json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).send('Error fetching projects.');
    }
  });


module.exports = router;