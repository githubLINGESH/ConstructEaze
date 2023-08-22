const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { submitprod, getpage ,handleFileUploads} = require('../controller/prodfController');

router.get('/',getpage);
router.post('/submitprodf', submitprod);
router.post('/uploads', upload.single('file'),handleFileUploads);

module.exports = router;
