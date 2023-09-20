const express = require('express');
const router = express.Router();
const materialController = require('../controller/materialController');
const controller = require('../controller/totalexpreportController');
// Route to handle material outward POST request
router.get('/matindownload-pdf', controller.downloadPDF);
router.get('/matindownload-excel', controller.downloadExcel);
router.get('/matindownload', materialController.downloadPDF);
router.get('/', materialController.getMaterialPage);
router.get('/get', materialController.getMaterialOutPage);
router.post('/submit', materialController.submitMaterial);
router.get('/autosearchmat',materialController.autosearchformat);



module.exports = router;
