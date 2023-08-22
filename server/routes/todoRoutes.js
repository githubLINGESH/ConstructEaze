const express = require('express');
const router = express.Router();
const todoController = require('../controller/todoController');

router.get('/', todoController.getTodoPage);
router.post('/submit-task', todoController.submitTask);
router.get('/tasks', todoController.getTasks);
router.post('/search-tasks', todoController.searchTasks);

module.exports = router;
