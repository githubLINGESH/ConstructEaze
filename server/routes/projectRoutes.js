const express = require('express');
const router = express.Router();
const { submitproj, getpag ,getproj} = require('../controller/projectController');


router.get('/',getpag);
router.post('/submitproj', submitproj);
router.get('/getprojects',getproj);


module.exports = router;