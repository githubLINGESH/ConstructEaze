const express = require('express');
const router = express.Router();
const materialController = require('../controller/materialController');

router.get('/', materialController.getMaterialPage);
router.get('/get', materialController.getMaterialOutPage);
router.post('/submit', materialController.submitMaterial);
router.post('/search-mat', materialController.searchMaterial);

module.exports = router;
