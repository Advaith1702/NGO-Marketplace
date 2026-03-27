const User = require('../models/User');

// @desc    Get all verified NGOs (with search)
// @route   GET /api/ngos
exports.getNgos = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: 'ngo', isVerified: true, isRestricted: false };

    if (search) {
      filter.$or = [
        { 'profileDetails.name': { $regex: search, $options: 'i' } },
        { 'profileDetails.description': { $regex: search, $options: 'i' } },
      ];
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

// @desc    Get single NGO
// @route   GET /api/ngos/:id
exports.getNgo = async (req, res) => {
  try {
    const ngo = await User.findById(req.params.id).select('-passwordHash');
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ message: 'NGO not found' });
    }
    res.json(ngo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
