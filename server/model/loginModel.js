    const mongoose = require('mongoose');

    const loginSchema = new mongoose.Schema({
    name:String,
    superId:String,
    email: String,
    password: String,
    auth: String,
    role:String,
    userId:String,
    });

    const Login = mongoose.model('Login', loginSchema);

    module.exports = Login;
