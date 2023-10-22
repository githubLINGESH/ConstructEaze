const express = require('express');
const router = express.Router();
const materialController = require('../controller/prodController');
const controller = require('../controller/vendorreportController');
const controlller = require('../controller/accountController');
const controllller = require('../controller/totalexpreportController');

router.get('/get-vendor-names',controlller.getVendorNames);
router.post('/download-pdf/:vendorName', controller.downloadPDF);
router.post('/download-excel/:vendorName', controller.downloadExcel);
router.post('/totdownload-pdf', controllller.downloadPDF);
router.post('/totdownload-excel', controllller.downloadExcel);
router.post('/download/:vendorName', materialController.downloadPDF);
router.get('/', materialController.getProductPage);
router.get('/getVendor/:vendorName', materialController.getVendor);
router.post('/submitprod', materialController.submitMaterial);
router.get('/autosearchprod', materialController.autosearchforprod);
router.get('/GeneratePNo',materialController.generatePNo);


module.exports = router;

