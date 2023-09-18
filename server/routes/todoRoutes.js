const express = require('express');
const router = express.Router();
const todoController = require('../controller/todoController');

router.get('/', todoController.getTodoPage);
router.post('/submit-task', todoController.submitTask);
router.get('/tasks', todoController.getTasks);
router.get('/autocomplete',todoController.autosearch);

module.exports = router;
