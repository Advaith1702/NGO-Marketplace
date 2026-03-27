const User = require('../models/User');

// @desc    Get all NGOs
// @route   GET /api/admin/ngos
exports.getNgos = async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json(ngos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (summary)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify an NGO
// @route   PUT /api/admin/ngos/:id/verify
exports.verifyNgo = async (req, res) => {
  try {
    const ngo = await User.findById(req.params.id);
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ message: 'NGO not found' });
    }

    ngo.isVerified = !ngo.isVerified;
    await ngo.save();

    res.json({
      _id: ngo._id,
      email: ngo.email,
      isVerified: ngo.isVerified,
      isRestricted: ngo.isRestricted,
      profileDetails: ngo.profileDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Restrict/unrestrict an NGO
// @route   PUT /api/admin/ngos/:id/restrict
exports.restrictNgo = async (req, res) => {
  try {
    const ngo = await User.findById(req.params.id);
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ message: 'NGO not found' });
    }

    ngo.isRestricted = !ngo.isRestricted;
    await ngo.save();

    res.json({
      _id: ngo._id,
      email: ngo.email,
      isVerified: ngo.isVerified,
      isRestricted: ngo.isRestricted,
      profileDetails: ngo.profileDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const Listing = require('../models/Listing');
    const Donation = require('../models/Donation');

    const [totalNgos, verifiedNgos, totalDonors, totalListings, donations] = await Promise.all([
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'ngo', isVerified: true }),
      User.countDocuments({ role: 'donor' }),
      Listing.countDocuments(),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      totalNgos,
      verifiedNgos,
      totalDonors,
      totalListings,
      totalDonations: donations[0]?.total || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
