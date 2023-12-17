const express = require('express');
const router = express.Router();
const materialController = require('../controller/prodController');
const controller = require('../controller/vendorreportController');
const controlller = require('../controller/accountController');

router.get('/get-vendor-names',controlller.getVendorNames);
router.post('/download-pdf/:vendorName', controller.downloadPDF);
router.post('/download-excel/:vendorName', controller.downloadExcel);
router.post('/download/:vendorName', materialController.downloadPDF);
router.get('/', materialController.getProductPage);
router.get('/getVendor/:vendorName', materialController.getVendor);
router.post('/submitprod', materialController.submitMaterial);
router.get('/autosearchprod', materialController.autosearchforprod);
router.get('/GeneratePNo',materialController.generatePNo);
router.get('/getprod', materialController.getProducts)



module.exports = router;

