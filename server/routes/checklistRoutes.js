const express = require('express');
const multer = require('multer');
const router = express.Router();

const checklistController = require('../controller/checklistController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination folder for uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    },
});

const upload = multer({ storage: storage });

router.post('/uploadImages', upload.array('image', 10), checklistController.uploadImages);
router.get('/getImages',checklistController.getImages);

module.exports = router;
