const express = require('express');
const router = express.Router();
const accountStatementController = require('../controller/accountController');

// Get vendor names

router.get('/',accountStatementController.getaccountpage);

router.get('/get-vendor-names', accountStatementController.getVendorNames);

// Get product names
router.get('/get-product-names', accountStatementController.getProductNames);

// Get vendor details by name
router.get('/get-vendor-details/:vendorName', accountStatementController.getVendorDetails);

// Get product details by name
router.get('/get-product-details/:productName', accountStatementController.getProductDetails);

router.post('/download-vendor-pdf/:vendorName', accountStatementController.downloadPDF);
router.post('/download-vendor-excel/:vendorName', accountStatementController.downloadExcel);

router.post('/download-product-pdf/:productName', accountStatementController.downloadPDFProd);
router.post('/download-product-excel/:productName', accountStatementController.downloadExcelProd);



router.post('/acc/vendor/:vendorName/details/date-range', accountStatementController.getVendorDetailsWithinDateRange);


module.exports = router;