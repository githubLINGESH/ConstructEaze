    const mongoose = require('mongoose');

    const loginSchema = new mongoose.Schema({
    projectId:String,
    name:String,
    superId:String,
    email: String,
    password: String,
    role:String,
    userId:String,
    E_name:String
    });

    const Login = mongoose.model('Login', loginSchema);

    module.exports = Login;
