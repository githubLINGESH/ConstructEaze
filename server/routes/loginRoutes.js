const express = require('express');
const router = express.Router();
const loginController = require('../controller/loginController');

const myMiddleware = (req, res, next) => {
    // Your middleware logic here
    next();
};
router.use(myMiddleware);

router.get('/', loginController.getLoginPage);
router.post('/', loginController.postLogin);

module.exports = router;
