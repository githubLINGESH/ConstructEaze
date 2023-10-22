const express = require('express');
const router = express.Router();
const { submitTask, getTasks, getpage ,markAttendance ,autosearch,attcount,attforrec,getworkertypecount,totalwages} = require('../controller/contractController');
const controllerr = require('../controller/labourrep');

router.get('/',getpage);
router.get('/det', getTasks);
router.post('/markAttendance',markAttendance);
router.post('/downloadforlab-pdf',controllerr.downloadPDFforlab);
router.post('/downloadforlab-excel', controllerr.downloadExcelforlab);
router.get('/autocomple',autosearch);
router.get('/attendance-count',attcount);
router.post('/markAttendanceForRecord',attforrec);
router.get('/getworkertype-count',getworkertypecount);
router.get('/totalwagesperday',totalwages);

module.exports = router;

