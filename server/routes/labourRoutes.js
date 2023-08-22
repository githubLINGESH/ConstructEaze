const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getlabour, submitlabour , handleFileUploadlab} = require('../controller/labourController');

router.get('/',getlabour);
router.post('/submitlab', submitlabour);
router.post('/uploadlab', upload.single('file'), handleFileUploadlab);
module.exports = router;
