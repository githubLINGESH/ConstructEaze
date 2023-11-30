const express = require('express');
const router = express.Router();
const materialController = require('../controller/materialController');

router.get('/matindownload', materialController.downloadPDF);
router.get('/', materialController.getMaterialPage);
router.get('/get/:selectedPno', materialController.getPurchaseDet);
router.post('/submit', materialController.submitMaterial);
router.get('/autosearchmat',materialController.autosearchformat);
router.get('/purchaseNo',materialController.getPurchaseNo);



module.exports = router;
