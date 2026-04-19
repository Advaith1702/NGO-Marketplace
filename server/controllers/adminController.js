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

// @desc    Get comprehensive admin dashboard analytics
// @route   GET /api/admin/dashboard
exports.getAdminDashboardStats = async (req, res) => {
  try {
    const Listing = require('../models/Listing');
    const Donation = require('../models/Donation');

    const [
      totalNgos,
      totalDonors,
      topNgoAgg,
      donationTrend,
      listingsByCategory,
      completedListings
    ] = await Promise.all([
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'donor' }),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$ngoId', totalDonations: { $sum: '$amount' } } },
        { $sort: { totalDonations: -1 } },
        { $limit: 1 }
      ]),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Listing.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Listing.countDocuments({ status: 'claimed' })
    ]);

    let topNgo = null;
    if (topNgoAgg.length > 0) {
      const ngo = await User.findById(topNgoAgg[0]._id).select('profileDetails.name email');
      if (ngo) {
        topNgo = {
          ngoId: ngo._id,
          name: ngo.profileDetails?.name || 'Unknown',
          totalDonations: topNgoAgg[0].totalDonations
        };
      }
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDonationTrend = donationTrend.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      total: item.total
    }));

    const formattedCategoryChart = listingsByCategory.map(item => ({
      category: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      count: item.count
    }));

    res.json({
      totalNgos,
      totalDonors,
      topNgo,
      donationTrend: formattedDonationTrend,
      listingsByCategory: formattedCategoryChart,
      completedListings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
