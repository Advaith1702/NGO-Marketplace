const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['ngo', 'donor', 'admin'],
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    profileDetails: {
      name: { type: String, required: true },
      description: { type: String, default: '' },
      registrationId: { type: String, default: '' },
      contact: { type: String, default: '' },
      category: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Indexes for optimized search and filtering
userSchema.index({ 'profileDetails.name': 1 });
userSchema.index({ 'profileDetails.category': 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
