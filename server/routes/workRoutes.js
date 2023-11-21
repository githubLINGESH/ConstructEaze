const express = require('express');
const router = express.Router();
const workDoneController = require('../controller/workController');

router.post('/workdone', workDoneController.createWorkDone);
router.get('/getwork', workDoneController.getWorkDoneList);

module.exports = router;