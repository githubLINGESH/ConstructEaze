
const authenticateMiddleware = (req, res, next) => {
    // Check if the user is authenticated
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

module.exports = authenticateMiddleware;
