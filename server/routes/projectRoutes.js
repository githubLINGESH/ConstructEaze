const express = require('express');
const router = express.Router();
const { submitproj, getpag ,getproj,clickProject,getRole} = require('../controller/projectController');


router.get('/',getpag);
router.post('/submitproj', submitproj);
router.get('/getprojects',getproj);
router.post('/storeProjectId',clickProject);
router.get('/getRole',getRole);

module.exports = router;