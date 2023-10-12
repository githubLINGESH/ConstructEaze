    const Login = require('../model/loginModel');
    const s_att = require('../model/SuperAttModel');

    exports.markAttendanceforSuperv = async (req, res) => {
        const superId = req.session.superId;
        console.log(superId); // Assuming you have the supervisor's ID in the session
    
        try {
            // Retrieve the supervisor's details based on superId
            const supervisor = await Login.findOne({ superId: superId });
            if (!supervisor) {
                return res.status(404).json({ error: 'Supervisor not found' });
            }
    
            // Determine the status and date of attendance
            const status = req.body.status;
            const latitude = req.body.latitude;
            const longitude = req.body.longitude; // This should be 'Present' or 'Absent'
            const date = new Date();
            date.setUTCHours(0, 0, 0, 0); // You can customize the date as needed
    
            // Set the login time (i.e., when the status is being posted)
            const loginTime = new Date();
    
            // Create a new SuperAtt document with login_t and other fields
            const superAtt = new s_att({
                superId :superId,
                name: supervisor.name,
                email: supervisor.email,
                status: status,
                latitude: latitude,
                longitude: longitude,
                date: date,
                login_t: loginTime, // Set the login time here
            });
    
            // Save the attendance document to the database
            const savedSuperAtt = await superAtt.save();
    
            // Respond with the saved document or a success message
            res.status(201).json(savedSuperAtt);
        } catch (error) {
            console.error('Error marking supervisor attendance:', error);
            res.status(500).send('Error marking supervisor attendance.');
        }
    };
    

    exports.getstatus = async(req,res) => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);

        try{
            const status = await s_att.findOne({date:date});
            res.status(200).json(status);
        }
        catch(error)
        {
            console.error('Error retrieving status:', error);
            res.status(500).send('Error retrieving status.');
        }
    }

    exports.logoutSupervisor = async (req, res) => {
        const superId = req.session.superId; // Get the supervisor's ID from the query parameters
        const date = new Date();
    
        try {
            // Find the supervisor's attendance document and update the logout_t time
            await s_att.findOneAndUpdate(
                { superId: superId, logout_t: { $exists: false } }, // You can add conditions here to ensure you're updating the correct document
                { logout_t: date }
            );
    
            res.status(200).send('Logout successful');
        } catch (error) {
            console.error('Error updating logout time:', error);
            res.status(500).send('Error updating logout time');
        }
    };
    