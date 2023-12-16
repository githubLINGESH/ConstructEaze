const express = require('express');
const router = express.Router();
const payController = require('../controller/paymentdetController');

router.get('/', payController.page);

router.post('/submit-ven', payController.submitven);

router.post('/submit-lab', payController.submitlab);

router.get('/getLab', payController.getLabourDet);

router.get('/getVen', payController.getVendorDet);

router.get('/get-vendor-names', payController.getVendorNames);

router.get('/get-labour-names', payController.getLabourNames);

router.get('/get-client-names', payController.getClientNames);

router.post('/download-pdf-get-vendor-details/:vendorName', payController.getVendorDetailsPDF);

router.post('/download-pdf-get-labour-details/:labourName', payController.getLabDetailsPDF);

router.post('/download-excel-get-vendor-details/:vendorName', payController.getVendorDetailsExcel);

router.post('/download-excel-get-labour-details/:labourName', payController.getLabDetailsExcel);

router.post('/download-excel-get-client-details/:clientName', payController.getClDetailsExcel);

router.post('/download-pdf-get-client-details/:clientName', payController.getClDetailsPDF);

module.exports = router;
