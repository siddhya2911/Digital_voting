const express = require('express');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
});

// Delete user (admin only)
router.delete('/users/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
});

// Reset election (admin only)
router.post('/reset', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Reset all votes and voting status
        await Vote.deleteMany({});
        await User.updateMany({}, { $set: { hasVoted: false } });
        await Candidate.updateMany({}, { $set: { votes: 0 } });

        res.json({ message: 'Election reset successfully' });
    } catch (error) {
        console.error('Error resetting election:', error);
        res.status(500).json({ message: 'Server error while resetting election' });
    }
});

module.exports = router;