const express = require('express');
const router = express.Router();
const addLabourController = require('../controller/addLabourController');

router.get('/', addLabourController.getAddLabourPage);
router.get('/get', addLabourController.getTasks);
router.post('/post', addLabourController.submitLabour);

module.exports = router;
