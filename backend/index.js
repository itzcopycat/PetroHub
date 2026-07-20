require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authController = require('./controllers/authController');

const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString)
  .then(() => console.log('Database Connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

const database = mongoose.connection;

database.on('error', (error) => {
  console.log('MongoDB runtime error:', error);
});

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authController);
app.use('/api/consumers', require('./routes/consumer'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve uploaded files (e.g. profile photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(3000, () => {
  console.log(`Server Started at ${3000}`);
});