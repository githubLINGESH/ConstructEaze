const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getvendor, submitvendor,handleFileUpl } = require('../controller/vendorController');

router.get('/',getvendor);
router.post('/submitvend', submitvendor);
router.post('/uploadvendor', upload.single('file'), handleFileUpl);

module.exports = router;
