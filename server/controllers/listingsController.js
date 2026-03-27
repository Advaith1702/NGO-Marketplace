const Listing = require('../models/Listing');
const Request = require('../models/Request');

// @desc    Create a new listing
// @route   POST /api/listings
exports.createListing = async (req, res) => {
  try {
    const { title, description, quantity, category, urgency } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const listing = await Listing.create({
      ownerNgoId: req.user._id,
      title,
      description,
      quantity: quantity || 1,
      category: category || 'other',
      urgency: urgency || 'medium',
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all available listings (exclude own)
// @route   GET /api/listings
exports.getListings = async (req, res) => {
  try {
    const { search, category, urgency } = req.query;
    const filter = { status: 'available' };

    // Exclude own listings if the user is an NGO
    if (req.user.role === 'ngo') {
      filter.ownerNgoId = { $ne: req.user._id };
    }

    if (category && category !== 'all') filter.category = category;
    if (urgency && urgency !== 'all') filter.urgency = urgency;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const listings = await Listing.find(filter)
      .populate('ownerNgoId', 'profileDetails.name email')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get own listings
// @route   GET /api/listings/mine
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ ownerNgoId: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.ownerNgoId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const { title, description, quantity, category, urgency, status } = req.body;
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (quantity) listing.quantity = quantity;
    if (category) listing.category = category;
    if (urgency) listing.urgency = urgency;
    if (status) listing.status = status;

    await listing.save();
    res.json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.ownerNgoId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    // Delete associated requests
    await Request.deleteMany({ listingId: listing._id });
    await listing.deleteOne();

    res.json({ message: 'Listing removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
