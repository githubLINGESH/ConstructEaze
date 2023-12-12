    const s_todo = require('../model/todoModel');
    const path = require('path')

    exports.getTodoPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..','..', 'todo.html'));
    };

    exports.submitTask = async (req, res) => {
    const { Taskname, StartDate, EndDate } = req.body;
    const userId = req.session.auth;
    const role = req.session.role;

    try {
        const record = new s_todo({
        projectId : req.session.projectId,
        userId:userId,
        role:role,
        Task_name: Taskname,
        Start_date: StartDate,
        End_date: EndDate,
        });

        await record.save();
        console.log('Record inserted successfully.');

        res.status(200).send('Record inserted successfully.');
    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).send('Error inserting record.');
    }
    };

    exports.getTasks = async (req, res) => {
        const projectId = req.session.projectId;
        const role = req.session.role;
    try {
        const tasks = await s_todo.find({projectId : projectId, role:role});

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).send('Error retrieving tasks.');
    }
    };

    exports.autosearch = async (req, res) => {
        const query = req.query.term.toLowerCase();
        
        try {
            const suggestions = await s_todo.find({ Task_name: { $regex: query, $options: 'i' } })
                .select('Task_name') // Select only the Task_name field
                .limit(10); // Limit the number of suggestions to 10
            
            const suggestionList = suggestions.map(task => task.Task_name);
            res.json(suggestionList);
        } catch (error) {
            console.error('Error fetching autocomplete suggestions:', error);
            res.status(500).send('Error fetching autocomplete suggestions.');
        }
    };

    exports.deleteTasks = async(req,res) => {

        const{name} = req.body;

            try{
                const deleteTasks = await s_todo.deleteOne({Task_name:name})
                res.status(200).json(deleteTasks);
            }
            catch{
                console.error("error deleting supervisor", error);
                res.status(500).send('Error deleting Supervisor');
            }
    }

    exports.getTaskDetails = async(req,res) =>{
        try {
            const tasks = await s_todo.find();
            return tasks;
        } catch (error) {
            console.error('Error retrieving tasks:', error);
            res.status(500).send('Error retrieving tasks.');
        }
        };

    const PDFDocument = require('pdfkit');

    // Assuming you have a function to fetch the product order details from the database
    const { getTaskDetails } = require('../controller/todoController');

    exports.downloadPDF = async (req, res) => {
    try {

        const productOrders = await getTaskDetails(); // Fetch details from the database

        const doc = new PDFDocument();
        res.setHeader('Content-Disposition', 'attachment; filename=task_details.pdf');
        doc.pipe(res);

        doc.fontSize(18).text('Material Wise Details', { align: 'center' });
        doc.moveDown();

        // Define the table object here
        const table = {
        headers: [' Start Date', 'End Date', 'Task Name'],
        rows: []
        };

        // Loop through each order and product
        productOrders.forEach(order => {
            const orderS_DateObj = new Date(order.Start_date);
            const formattedSDate = orderS_DateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            const orderE_DateObj = new Date(order.Start_date);
            const formattedEDate = orderE_DateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        
            table.rows.push([
                formattedSDate,
                formattedEDate,
                order.Task_name,
            ]);
            });
        
        

        // Now you can generate the table as you intended
        const initialX = 50;
        const rowHeight = 25;
        const columnWidth = 100;

        // Draw the table header
        doc.fontSize(12);
        table.headers.forEach((header, i) => {
        doc.text(header, initialX + i * columnWidth, doc.y, { width: columnWidth });
        });
        doc.moveDown();

        // Draw the table rows
        table.rows.forEach((row, i) => {
        row.forEach((text, j) => {
            doc.text(text, initialX + j * columnWidth, doc.y, { width: columnWidth });
        });
        doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
    };
