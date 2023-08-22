const express = require('express');
const router = express.Router();
const materialController = require('../controller/prodController');
const controller = require('../controller/vendorreportController');

router.get('/download-pdf', controller.downloadPDF);
router.get('/download-excel', controller.downloadExcel);
router.get('/', materialController.getProductPage);
router.get('/getprod', materialController.getTasks);
router.post('/submitprod', materialController.submitMaterial);
router.post('/search-mat', materialController.searchMaterial);


module.exports = router;
