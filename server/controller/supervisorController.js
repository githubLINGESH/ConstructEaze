const path = require('path');
    const Login = require('../model/loginModel');
    

    exports.getpagSup = async(req,res) => {
    res.sendFile(path.join(__dirname, '..', '..','supmas.html'));
    };

    exports.submitSup = async (req, res) => {
    const { name,email, userid ,pass} = req.body;
    const userId = req.session.auth;
    const role = req.session.role;

    try {
        const record = new Login({
            superId:userid,
            userId:userId,
            role:role,
            name : name ,
            email: email,
            password: pass,
        });

    await record.save();
    res.status(200).send("Record inserted successfully.");

    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
    }
    };

    exports.getSuber = async (req, res) => {
        const userId = req.session.auth;
        const role = req.session.role;
        
        try {
            // Query to find documents where both 'name' and 'superId' fields exist
            const projects = await Login.find({
                name: { $exists: true },
                superId: { $exists: true }
            });
    
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