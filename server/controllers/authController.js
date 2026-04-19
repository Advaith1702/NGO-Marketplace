const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, role, name, description, registrationId, contact, category } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: 'Please provide email, password, role and name' });
    }

    if (!['ngo', 'donor'].includes(role)) {
      return res.status(400).json({ message: 'Role must be ngo or donor' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      email,
      passwordHash: password,
      role,
      isVerified: role === 'donor', // donors auto-verified
      profileDetails: {
        name,
        description: description || '',
        registrationId: registrationId || '',
        contact: contact || '',
        category: category || '',
      },
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isRestricted: user.isRestricted,
      profileDetails: user.profileDetails,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isRestricted: user.isRestricted,
      profileDetails: user.profileDetails,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    email: req.user.email,
    role: req.user.role,
    isVerified: req.user.isVerified,
    isRestricted: req.user.isRestricted,
    profileDetails: req.user.profileDetails,
  });
};
