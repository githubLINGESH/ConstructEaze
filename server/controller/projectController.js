    const path = require('path');
    const e_projects = require('../model/projectModel');
        

        exports.getpag = async(req,res) => {
        res.sendFile(path.join(__dirname, '..', '..','addproj.html'));
        };

        exports.submitproj = async (req, res) => {
        const { Project_name,Address,City} = req.body;
        const userId = req.session.userId;
        const role = req.session.role;

        try {

            const record = new e_projects({
                userId:userId,
                role:role,
                Project_name : Project_name ,
                Address: Address,
                City  : City,
            });

        const savedRecord = await record.save();
        console.log('Record inserted successfully.');

        res.status(200).json(savedRecord);
        } catch (error) {
            console.error('Error inserting record:', error);
            res.status(500).send('Error inserting record.');
        }
        };

        exports.getproj =  async (req, res) => {
            const userId = req.session.userId;
            try {
                const projects = await e_projects.find({userId:userId});
                res.status(200).json(projects);
                } catch (error) {
                console.error('Error fetching projects:', error);
                res.status(500).send('Error fetching projects.');
                }
            };


            exports.clickProject = (req, res) => {
                // Capture the clicked projectId from the request or request parameters
                const projectId = req.body.projectId;
            
                // Store the projectId in req.session.projectId
                req.session.projectId = projectId;
                console.log(projectId);
                res.sendFile(path.join(__dirname, '..', '..', 'clientf.html'));
            };

            exports.getRole = (req, res) => {
                const role = req.session.role;
                if (role) {
                    res.status(200).json({ role });
                    } else {
                    res.status(401).json({ message: 'Role not found in session' });
                    }
                };