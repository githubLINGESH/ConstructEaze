const express = require('express');
const router = express.Router();
const { submitTask, getTasks, getpage ,markAttendance ,autosearch,attcount} = require('../controller/contractController');
const controllerr = require('../controller/labourrep');

router.get('/',getpage);
router.post('/submit', submitTask);
router.get('/det', getTasks);
router.post('/markAttendance',markAttendance);
router.get('/downloadforlab-pdf',controllerr.downloadPDFforlab);
router.get('/downloadforlab-excel', controllerr.downloadExcelforlab);
router.get('/autocomple',autosearch);
router.get('/attendance-count',attcount);

module.exports = router;
