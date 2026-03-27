const Request = require('../models/Request');
const Listing = require('../models/Listing');

// @desc    Create a request for a listing
// @route   POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const { listingId, message } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'available') {
      return res.status(400).json({ message: 'This listing is no longer available' });
    }

    if (listing.ownerNgoId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request your own listing' });
    }

    // Check if already requested
    const existing = await Request.findOne({
      listingId,
      requestingNgoId: req.user._id,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this listing' });
    }

    const request = await Request.create({
      listingId,
      requestingNgoId: req.user._id,
      message: message || '',
    });

    // Update listing status to pending
    listing.status = 'pending';
    await listing.save();

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get incoming requests (on own listings)
// @route   GET /api/requests/incoming
exports.getIncomingRequests = async (req, res) => {
  try {
    // Find all listings owned by this NGO
    const myListings = await Listing.find({ ownerNgoId: req.user._id });
    const listingIds = myListings.map((l) => l._id);

    const requests = await Request.find({ listingId: { $in: listingIds } })
      .populate('listingId', 'title status')
      .populate('requestingNgoId', 'profileDetails.name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my outgoing requests
// @route   GET /api/requests/mine
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requestingNgoId: req.user._id })
      .populate('listingId', 'title status ownerNgoId')
      .populate({
        path: 'listingId',
        populate: { path: 'ownerNgoId', select: 'profileDetails.name' },
      })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept a request
// @route   PUT /api/requests/:id/accept
exports.acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('listingId');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Verify ownership
    if (request.listingId.ownerNgoId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'accepted';
    await request.save();

    // Mark listing as claimed
    const listing = await Listing.findById(request.listingId._id);
    listing.status = 'claimed';
    await listing.save();

    // Reject all other pending requests for this listing
    await Request.updateMany(
      { listingId: request.listingId._id, _id: { $ne: request._id }, status: 'pending' },
      { status: 'rejected' }
    );

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject a request
// @route   PUT /api/requests/:id/reject
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('listingId');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Verify ownership
    if (request.listingId.ownerNgoId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'rejected';
    await request.save();

    // If no more pending requests, set listing back to available
    const pendingCount = await Request.countDocuments({
      listingId: request.listingId._id,
      status: 'pending',
    });
    if (pendingCount === 0) {
      const listing = await Listing.findById(request.listingId._id);
      if (listing.status === 'pending') {
        listing.status = 'available';
        await listing.save();
      }
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
