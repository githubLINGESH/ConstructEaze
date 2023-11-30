        const express = require('express');
        const session = require('express-session');
        const cors = require('cors');
        const clientRouter = require('./server/routes/clientRoutes.js');
        const prodfRouter = require('./server/routes/prodfRoutes.js');
        const vendorRouter = require('./server/routes/vendorRoutes.js');
        const labourRouter = require('./server/routes/labourRoutes.js');
        const matRouter = require('./server/routes/materialRoutes.js');
        const contractRouter = require('./server/routes/contractRoutes.js');
        const taskSearchRouter = require('./server/routes/todoRoutes.js');
        const productRouter = require('./server/routes/prodRoute.js');
        const matoutRouter = require('./server/routes/materialoutRoutes.js');
        const projectRouter = require('./server/routes/projectRoutes.js');
        const accountRouter= require('./server/routes/accountsRoutes');
        const supervisorRouter = require('./server/routes/SupervisorRoutes.js');
        const loginRouter = require('./server/routes/loginRoutes.js');
        const superAttRouter = require('./server/routes/superAttRoutes.js');
        const checklistRouter = require('./server/routes/checklistRoutes.js');
        const drawRouter = require('./server/routes/drawRoutes.js');
        const workRouter = require('./server/routes/workRoutes.js');
        const paymentRouter = require('./server/routes/paymentRoutes.js');

        const mongoose = require('mongoose')
        const bodyParser = require('body-parser');
        const app = express();
        const port = process.env.PORT || 3000;

        const dbURL = 'mongodb+srv://jayran:' + encodeURIComponent('O9UdszTUcb8j2KA7') + '@cluster0.v6wdfkq.mongodb.net/login?retryWrites=true&w=majority';
            mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                console.log('Connected to MongoDB');
                // Start the server only after successful database connection
                app.listen(port, () => {
                console.log(`Server started on http://localhost:${port}`);
                });
            })
            .catch((error) => {
                console.error('Error connecting to MongoDB', error);
            });
            
            app.use(cors());

            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(bodyParser.json());
            app.use(session({
            secret: 'aR7$Kp#9@2L&jF5*!mDqZtVwYzBxNvP4',
            resave: false,
            saveUninitialized: true
            }));
        
        //app.set('view engine', 'ejs');
        app.use(express.static(__dirname));

        // Mount the routers on the corresponding paths
        app.use('/login', loginRouter);
        app.use('/client',clientRouter);
        app.use('/prodf', prodfRouter);
        app.use('/vendor', vendorRouter);
        app.use('/labour', labourRouter);
        app.use('/mat', matRouter);
        app.use('/contract', contractRouter);
        app.use('/todo', taskSearchRouter);
        app.use('/prod', productRouter);
        app.use('/mato', matoutRouter);
        app.use('/proj', projectRouter);
        app.use('/acc',accountRouter);
        app.use('/sup',supervisorRouter);
        app.use('/sAtt',superAttRouter);
        app.use('/check',checklistRouter);
        app.use('/draw',drawRouter);
        app.use('/work',workRouter);
        app.use('/pay',paymentRouter);




