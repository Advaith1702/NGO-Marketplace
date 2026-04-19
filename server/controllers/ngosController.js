const User = require('../models/User');
const Listing = require('../models/Listing');
const Donation = require('../models/Donation');
const mongoose = require('mongoose');

// @desc    Get all verified NGOs (with search + category filter)
// @route   GET /api/ngos
exports.getNgos = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { role: 'ngo', isVerified: true, isRestricted: false };

    if (search) {
      filter.$or = [
        { 'profileDetails.name': { $regex: search, $options: 'i' } },
        { 'profileDetails.description': { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter['profileDetails.category'] = category;
    }

    const ngos = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json(ngos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single NGO with computed stats
// @route   GET /api/ngos/:id
exports.getNgo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    const ngo = await User.findById(id).select('-passwordHash');
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ message: 'NGO not found' });
    }

    // Compute statistics
    const ngoId = ngo._id;

    const listingsCount = await Listing.countDocuments({ ownerNgoId: ngoId });

    const donationAgg = await Donation.aggregate([
      { $match: { ngoId: ngoId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalDonations = donationAgg.length > 0 ? donationAgg[0].total : 0;

    const ngoData = ngo.toObject();
    ngoData.stats = {
      listingsCount,
      totalDonations,
    };

    res.json(ngoData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
