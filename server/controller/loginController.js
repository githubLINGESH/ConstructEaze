    const path = require('path');
    const Login = require('../model/loginModel');

    const validateLogin = async (email, password) => {
        let query = {email,password}
    
        return await Login.findOne(query);
        };
    

    exports.getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname,'..', '..', 'login.html'));
    };

    exports.postLogin = (req, res) => {
        const { email, password } = req.body;
        
        // Set the default role to 'Engineer'
        let role = 'Engineer';
    
        validateLogin(email, password)
            .then((user) => {
                if (user) {
                    console.log('Login successful');
    
                    req.session.userId = user.userId; // Store the user's ID in the session
                    req.session.role = user.superId ? 'Supervisor' : 'Engineer';
                    req.session.name = user.name;

                    req.session.superId = user.superId;

                    console.log(req.session.name);
                    console.log(req.session.role);
                    res.sendFile(path.join(__dirname, '..', '..', 'home.html'));
                } else {
                    console.log('Invalid email or password');
                    res
                        .status(401)
                        .send('<script>document.getElementById("message").innerText = "Invalid email or password";</script>');
                }
            })
            .catch((error) => {
                console.error('Error validating login', error);
                res.status(500).send('<script>document.getElementById("message").innerText = "Error validating login";</script>');
            });
    };
    
