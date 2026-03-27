const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Create a donation
// @route   POST /api/donations
exports.createDonation = async (req, res) => {
  try {
    const { ngoId, amount, message } = req.body;

    if (!ngoId || !amount) {
      return res.status(400).json({ message: 'NGO ID and amount are required' });
    }

    if (amount < 1) {
      return res.status(400).json({ message: 'Amount must be at least 1' });
    }

    // Verify NGO exists and is verified
    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ message: 'NGO not found' });
    }
    if (!ngo.isVerified) {
      return res.status(400).json({ message: 'Cannot donate to an unverified NGO' });
    }

    // Simulated payment — always succeeds
    const donation = await Donation.create({
      donorId: req.user._id,
      ngoId,
      amount,
      message: message || '',
      status: 'completed',
    });

    const populated = await donation.populate('ngoId', 'profileDetails.name email');

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get donor's donation history
// @route   GET /api/donations/mine
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id })
      .populate('ngoId', 'profileDetails.name email')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get donations received by NGO
// @route   GET /api/donations/received
exports.getReceivedDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ ngoId: req.user._id })
      .populate('donorId', 'profileDetails.name email')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
