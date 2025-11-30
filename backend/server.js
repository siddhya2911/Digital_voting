const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system')
    .then(async () => {
        console.log('MongoDB connected successfully');
        
        // Create admin user if doesn't exist
        const User = require('./models/User');
        const adminExists = await User.findOne({ email: 'siddharthbade29@gmail.com' });
        
        if (!adminExists) {
            const adminUser = new User({
                name: 'Admin User',
                email: 'siddharthbade29@gmail.com',
                password: 'Siddharth2004',
                role: 'admin',
                image: 'admin-default.jpg'
            });
            await adminUser.save();
            console.log('Admin user created successfully');
        }
    })
    .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/admin', require('./routes/admin'));

// Basic route to test server
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});