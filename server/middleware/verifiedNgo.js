// Middleware to check if an NGO is verified and not restricted
const verifiedNgo = (req, res, next) => {
  if (req.user.role !== 'ngo') {
    return res.status(403).json({ message: 'Only NGOs can perform this action' });
  }
  if (!req.user.isVerified) {
    return res.status(403).json({ message: 'Your NGO must be verified by an admin before performing this action' });
  }
  if (req.user.isRestricted) {
    return res.status(403).json({ message: 'Your NGO has been restricted. Contact admin for details.' });
  }
  next();
};

module.exports = { verifiedNgo };
