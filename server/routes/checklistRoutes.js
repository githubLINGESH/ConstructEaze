const express = require('express');
const multer = require('multer');
const router = express.Router();

const checklistController = require('../controller/checklistController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post('/uploadFiles', upload.array('file', 10), checklistController.uploadFiles);
router.get('/getFiles', checklistController.getFiles);
router.delete('/removeFiles/:id', checklistController.removeFile);

module.exports = router;
