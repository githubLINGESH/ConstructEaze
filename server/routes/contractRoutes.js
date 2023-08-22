const express = require('express');
const router = express.Router();
const { submitTask, getTasks, getpage ,markAttendance} = require('../controller/contractController');

router.get('/',getpage);
router.post('/submit', submitTask);
router.get('/det', getTasks);
router.post('/markAttendance',markAttendance);

module.exports = router;
