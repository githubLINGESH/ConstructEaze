const path = require('path');
    const Login = require('../model/loginModel');
    

    exports.getpagSup = async(req,res) => {
    res.sendFile(path.join(__dirname, '..', '..','supmas.html'));
    };

    exports.submitSup = async (req, res) => {
    const { name,email, userid ,pass} = req.body;
    const userId = req.session.userId;
    const E_name = req.session.name;
    const projectId = req.session.projectId;

    try {
        const record = new Login({
            projectId : projectId,
            superId:userid,
            userId:userId,
            E_name: E_name,
            name : name,
            email: email,
            password: pass,
        });

    await record.save();
    
    res.status(200).send("ok");

    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
    }
    };

    exports.getSuber = async (req, res) => {
        const userId = req.session.userId;
        const role = req.session.role;
        const projectId = req.session.projectId;

        try {
            // Query to find documents where both 'name' and 'superId' fields exist
            const projects = await Login.find({
                userId : userId,
                projectId : projectId,
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