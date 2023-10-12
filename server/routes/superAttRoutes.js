const express = require('express');
const router = express.Router();
const {markAttendanceforSuperv,getstatus,logoutSupervisor} = require('../controller/superAttController');

router.post('/superAtt',markAttendanceforSuperv);
router.get('/getstatus',getstatus);
router.put('/logout',logoutSupervisor);


module.exports = router;
