const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { submitTask, getpage ,handleFileUpload} = require('../controller/clientController');

router.get('/',getpage);
router.post('/sub', submitTask);
router.post('/upload', upload.single('file'),handleFileUpload);

module.exports = router;
