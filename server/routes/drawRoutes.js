const express = require('express');
const multer = require('multer');
const router = express.Router();

const drawController = require('../controller/drawController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post('/uploadFiles', upload.array('file', 10), drawController.uploadFiles);
router.get('/getFiles', drawController.getFiles);
router.delete('/removeFile/:id', drawController.removeFile);
router.post('/uploadCad', drawController.uploadCad);

module.exports = router;
