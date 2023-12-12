const express = require('express');
const router = express.Router();
const todoController = require('../controller/todoController');

router.get('/', todoController.getTodoPage);
router.post('/submit-task', todoController.submitTask);
router.get('/tasks', todoController.getTasks);
router.get('/autocomplete',todoController.autosearch);
router.delete('/DeleteTodo', todoController.deleteTasks);
router.get('/get-tasks', todoController.getTaskDetails);
router.post('/download-pdf', todoController.downloadPDF);

module.exports = router;
