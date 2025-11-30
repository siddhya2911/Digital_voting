const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
require('dotenv').config();

async function createSampleCandidates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system');
    console.log('✅ Connected to MongoDB');

    // Clear existing candidates
    await Candidate.deleteMany({});
    console.log('✅ Cleared existing candidates');

    // Create sample candidates
    const sampleCandidates = [
      {
        name: 'Narendra Modi ',
        party: 'Bjp Party',
        symbol: 'Lotus',
        image: 'candidate1.jpg',
        votes: 0,
        userId: new mongoose.Types.ObjectId()
      },
      {
        name: 'Rahul Gandhi',
        party: 'Congress Party',
        symbol: 'Hand',
        image: 'candidate2.jpg',
        votes: 0,
        userId: new mongoose.Types.ObjectId()
      },
      {
        name: 'Raj Thakare',
        party: 'Manse Party',
        symbol: 'Railway engine',
        image: 'candidate3.jpg',
        votes: 0,
        userId: new mongoose.Types.ObjectId()
      }
    ];

    await Candidate.insertMany(sampleCandidates);
    console.log('✅ Sample candidates created successfully!');

    // Verify they were created
    const candidates = await Candidate.find();
    console.log('📋 Current candidates:', candidates);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating candidates:', error);
    process.exit(1);
  }
}

createSampleCandidates();