const express = require('express');
const Vote = require('../models/Vote');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const auth = require('../middleware/auth');

const router = express.Router();

// Cast vote
router.post('/', auth, async (req, res) => {
    try {
        const { candidateId } = req.body;
        const voterId = req.user._id;

        if (!candidateId) {
            return res.status(400).json({ message: 'Candidate ID is required' });
        }

        // Check if user has already voted
        if (req.user.hasVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Check if candidate exists
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Create vote
        const vote = new Vote({
            voter: voterId,
            candidate: candidateId
        });

        await vote.save();

        // Update user's hasVoted status
        await User.findByIdAndUpdate(voterId, { hasVoted: true });

        // Update candidate's vote count
        await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });

        res.status(201).json({ message: 'Vote cast successfully' });
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({ message: 'Server error while casting vote' });
    }
});

// Get voting results
router.get('/results', async (req, res) => {
    try {
        const results = await Candidate.find().sort({ votes: -1 });
        res.json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ message: 'Server error while fetching results' });
    }
});

module.exports = router;