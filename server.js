const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3001;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Serve the HTML files
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// Connection URL and database name
const url = 'mongodb+srv://lakhanimeet:lakhanimeet@cluster0.okzfoxe.mongodb.net';
const dbName = 'meet';

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Create a schema for the data
const dataSchema = new mongoose.Schema({
    username: String,
    roll_number: String,
    password: String
});
// Create a model for the data
const Data = mongoose.model('start', dataSchema);

// Connect to the MongoDB database
mongoose.connect(`${url}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to the database');

        //Post Method start.............................   
        app.post('/submit-form', async (req, res) => {
            const { username, roll_number, password } = req.body;

            try {
                // Check if the username or email is already registered
                // Hash the password 
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create a new user
                const newUser = new Data({ username, roll_number, password: hashedPassword });
                await newUser.save();

                return res.redirect('/login.html');
            } catch (error) {
                console.error('Failed to register user:', error);
                return res.redirect('/error.html');
            }
        });

        //Post Method End......................

//Login Routes --------------------------------
        app.post('/login', async (req, res) => {
            const { username, password } = req.body;

            try {
                // Find the user by username
                const user = await Data.findOne({ username });
                if (!user) {
                    return res.render('login', { error: 'Invalid username or password' });
                }

                // Compare the password
                const isPasswordValid = await bcrypt.compare(password, user.password);

                return res.redirect('/dashboard.html');
            } catch (error) {
                console.error('Failed to login:', error);
                res.render('login', { error: 'Failed to login' });
            }
        });

        //Get Method End......................................

        //Put/Update Method start =================================
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const updates = req.body;

            try {
                // Find the user by id
                const user = await Data.updateOne({ _id: id }, updates);


                if (user.nModified === 0) {
                    return res.status(404).json({ message: `Cannot find user with id ${id}` });
                }


                return res.status(200).json({ success: true, message: 'User updated successfully', user });
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });

        //Put/Update Method End ===========================================

        app.delete('/users/:id', async (req, res) => {
            Data.deleteOne({ _id: req.params.id }).then(
                () => {
                    res.status(200).json({
                        success: "User deleted successfully"
                    });
                }).catch((error) => {
                    res.status(500).json({ success: false, message: 'server error' });
                });
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to the database', err);
    });
