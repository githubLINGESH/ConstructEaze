const express = require('express');
const router = express.Router();
const materialOutController = require('../controller/materialoutController');
const controller = require('../controller/matrepController');
// Route to handle material outward POST request

router.get('/matdownload-pdf', controller.downloadPDF);
router.get('/matdownload-excel', controller.downloadExcel);
router.get('/', materialOutController.getp);
router.post('/material-outward', materialOutController.createMaterialOut);
router.get('/getmato', materialOutController.getMaterialOutPage);
router.get('/autosearchmato', materialOutController.autosearchformato);


module.exports = router;