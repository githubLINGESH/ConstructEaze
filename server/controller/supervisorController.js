const path = require('path');
    const Login = require('../model/loginModel');
    

    exports.getpagSup = async(req,res) => {
    res.sendFile(path.join(__dirname, '..', '..','supmas.html'));
    };

    exports.submitSup = async (req, res) => {
    const { name, userid ,pass} = req.body;
    const userId = req.session.auth;
    const role = req.session.role;

    try {
        const record = new Login({
            superId:userid,
            userId:userId,
            role:role,
            name : name ,
            password: pass,
        });

        await record.save();
    console.log('Record inserted successfully.');

    res.status(200).send("success");
    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
    }
    };

    exports.getSuber =  async (req, res) => {
        const userId = req.session.auth;
        const role = req.session.role;
        try {
            const projects = await Login.find();
            res.status(200).json(projects);
            } catch (error) {
            console.error('Error fetching projects:', error);
            res.status(500).send('Error fetching projects.');
            }
        };

        exports.deleteSuper = async(req,res) => {

            const{name} = req.body;

            try{
                const deleteSupervisor = await Login.deleteOne({name:name})
                res.status(200).json(deleteSupervisor);
            }
            catch{
                console.error("error deleting supervisor", error);
                res.status(500).send('Error deleting Supervisor');
            }
        }