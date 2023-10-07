const express = require('express');
const router = express.Router();
const { submitSup, getpagSup ,getSuber, deleteSuper} = require('../controller/supervisorController');


router.get('/',getpagSup);
router.post('/submitSup', submitSup);
router.get('/getSuper',getSuber);
router.delete('/deleteSup',deleteSuper);


module.exports = router;