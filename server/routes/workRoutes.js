const express = require('express');
const router = express.Router();
const workDoneController = require('../controller/workController');

router.post('/workdone', workDoneController.createWorkDone);
router.get('/getwork', workDoneController.getWorkDoneList);
router.delete('/DeleteWork',workDoneController.deleteWork);
router.post('/download-pdf',workDoneController.downloadPDF);

module.exports = router;