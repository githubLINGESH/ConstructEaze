const express = require('express');
const multer = require('multer');
const router = express.Router();

const drawController = require('../controller/drawController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    },
});

const upload = multer({ storage: storage });

router.post('/uploadImages', upload.array('image', 10), drawController.uploadImages);
router.get('/getImages',drawController.getImages);
router.delete('/removeImage/:id', drawController.removeImage);

module.exports = router;
