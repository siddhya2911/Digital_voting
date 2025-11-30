const express = require('express');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all candidates
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find().populate('userId', 'name email');
        res.json(candidates);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ message: 'Server error while fetching candidates' });
    }
});

// Add candidate (admin only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { name, party, symbol, userId } = req.body;

        if (!name || !party || !symbol || !userId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const candidate = new Candidate({
            name,
            party,
            symbol,
            userId,
            image: user.image
        });

        await candidate.save();
        
        // Update user role to candidate
        await User.findByIdAndUpdate(userId, { 
            role: 'candidate', 
            candidateId: candidate._id 
        });

        res.status(201).json(candidate);
    } catch (error) {
        console.error('Error adding candidate:', error);
        res.status(500).json({ message: 'Server error while adding candidate' });
    }
});

module.exports = router;