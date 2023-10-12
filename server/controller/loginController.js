    const path = require('path');
    const Login = require('../model/loginModel');

    const validateLogin = async (email, password, auth) => {
        let query = {email,password}
    
        if (auth) {
            query.auth = auth;
        }
    
        return await Login.findOne(query);
        };
    

    exports.getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname,'..', '..', 'login.html'));
    };

    exports.postLogin = (req, res) => {
    const { email, password, auth} = req.body;
    const toggle = req.body.toggle;
    const role = auth ? 'engineer' : 'supervisor';

    console.log(toggle);

    validateLogin(email, password, auth)
        .then((user) => {
        if (user) {
            console.log('Login successful');
            req.session.auth = auth;
            req.session.role = role;
            req.session.superId = user.superId;
            res.sendFile(path.join(__dirname,'..', '..','home.html'));
        } else {
            console.log('Invalid email, password, or authentication code');
            res
            .status(401)
            .send('<script>document.getElementById("message").innerText = "Invalid email, password, or authentication code";</script>');
        }
        })
        .catch((error) => {
        console.error('Error validating login', error);
        res.status(500).send('<script>document.getElementById("message").innerText = "Error validating login";</script>');
        });
    };
