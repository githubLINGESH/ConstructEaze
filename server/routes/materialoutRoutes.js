const express = require('express');
const router = express.Router();
const materialOutController = require('../controller/materialoutController');
const controller = require('../controller/matrepController');

router.post('/matdownload-pdf/:productName', controller.downloadPDF);
router.post('/matdownload-excel/:productName', controller.downloadExcel);
router.get('/matdownload', materialOutController.downloadPDF);
router.get('/', materialOutController.getp);
router.post('/material-used', materialOutController.updatestocks);
router.get('/autosearchmato', materialOutController.autosearchformato);
router.post('/update-to-stocks', materialOutController.updateTotalSuppliedQuantity);
router.get('/getstocks', materialOutController.getstocks);
router.put('/updatestocks',materialOutController.updatestocks);



module.exports=router;