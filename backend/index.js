require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authController = require('./controllers/authController');

const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error);
});

database.once('connected', () => {
    console.log('Database Connected');
});

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authController);
app.use('/api/consumers', require('./routes/consumer'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));

// Serve uploaded files (e.g. profile photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(3000, () => {
    console.log(`Server Started at ${3000}`);
});