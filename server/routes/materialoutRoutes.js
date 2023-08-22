const express = require('express');
const router = express.Router();
const materialOutController = require('../controller/materialoutController');

// Route to handle material outward POST request
router.get('/', materialOutController.getp);
router.post('/material-outward', materialOutController.createMaterialOut);
router.get('/getmato', materialOutController.getMaterialOutPage);


module.exports = router;