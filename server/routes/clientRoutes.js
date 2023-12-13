const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { submitTask, getpage ,handleFileUpload , Payment} = require('../controller/clientController');

router.get('/',getpage);
router.post('/sub', submitTask);
router.post('/upload', upload.single('file'),handleFileUpload);
router.post('/submit-pay',Payment);

module.exports = router;
