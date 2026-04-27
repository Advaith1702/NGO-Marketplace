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

// @desc    Update current NGO profile and trigger reverification
// @route   PUT /api/ngos/me
exports.updateMyNgoProfile = async (req, res) => {
  try {
    const { description, registrationId, contact, category } = req.body;
    const ngo = await User.findById(req.user._id);

    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ message: 'NGO not found' });
    }

    const currentProfile = ngo.profileDetails || {};
    const updates = {
      name: currentProfile.name || '',
      description: description !== undefined ? String(description).trim() : (currentProfile.description || ''),
      registrationId: registrationId !== undefined ? String(registrationId).trim() : (currentProfile.registrationId || ''),
      contact: contact !== undefined ? String(contact).trim() : (currentProfile.contact || ''),
      category: category !== undefined ? String(category).trim() : (currentProfile.category || ''),
    };

    const hasProfileChanges =
      updates.name !== (ngo.profileDetails.name || '') ||
      updates.description !== (ngo.profileDetails.description || '') ||
      updates.registrationId !== (ngo.profileDetails.registrationId || '') ||
      updates.contact !== (ngo.profileDetails.contact || '') ||
      updates.category !== (ngo.profileDetails.category || '');

    ngo.profileDetails.description = updates.description;
    ngo.profileDetails.registrationId = updates.registrationId;
    ngo.profileDetails.contact = updates.contact;
    ngo.profileDetails.category = updates.category;

    if (hasProfileChanges) {
      ngo.isVerified = false;
      ngo.pendingReverification = true;
    }

    await ngo.save();

    res.json({
      _id: ngo._id,
      email: ngo.email,
      role: ngo.role,
      isVerified: ngo.isVerified,
      isRestricted: ngo.isRestricted,
      pendingReverification: ngo.pendingReverification,
      profileDetails: ngo.profileDetails,
      message: hasProfileChanges
        ? 'Profile updated. Your NGO is now pending admin reverification.'
        : 'No profile changes detected.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard analytics for logged-in NGO
// @route   GET /api/ngo/dashboard
exports.getNgoDashboardStats = async (req, res) => {
  try {
    const ngoId = req.user._id;

    const [
      totalAmountAgg,
      donationTrend,
      totalListings,
      listingsByStatus
    ] = await Promise.all([
      Donation.aggregate([
        { $match: { ngoId: ngoId, status: 'completed' } },
        { $group: { _id: null, totalReceived: { $sum: '$amount' } } }
      ]),
      Donation.aggregate([
        { $match: { ngoId: ngoId, status: 'completed' } },
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
      Listing.countDocuments({ ownerNgoId: ngoId }),
      Listing.aggregate([
        { $match: { ownerNgoId: ngoId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const totalReceived = totalAmountAgg.length > 0 ? totalAmountAgg[0].totalReceived : 0;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDonationTrend = donationTrend.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      total: item.total
    }));

    const formattedStatusChart = listingsByStatus.map(item => ({
      status: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      count: item.count
    }));

    res.json({
      totalReceived,
      totalListings,
      donationTrend: formattedDonationTrend,
      listingsByStatus: formattedStatusChart
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
