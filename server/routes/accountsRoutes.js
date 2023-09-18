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

module.exports = router;
