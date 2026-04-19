import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getListings, createRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { HiOutlineSearch, HiOutlineClock, HiOutlineTag, HiOutlineHand } from 'react-icons/hi';

const Marketplace = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [urgency, setUrgency] = useState('all');
  const [requestingId, setRequestingId] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchListings = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (urgency !== 'all') params.urgency = urgency;
      const { data } = await getListings(params);
      setListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, urgency]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchListings();
  };

  const openRequestModal = (listing) => {
    setSelectedListing(listing);
    setMessage('');
    setShowModal(true);
  };

  const handleRequest = async () => {
    if (!selectedListing) return;
    setRequestingId(selectedListing._id);
    try {
      await createRequest({ listingId: selectedListing._id, message });
      setShowModal(false);
      setSuccessMsg('Request sent successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequestingId('');
    }
  };

  const urgencyColor = (u) => {
    switch (u) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const categoryEmoji = (c) => {
    const map = { food: '🍲', clothing: '👕', medical: '💊', education: '📚', electronics: '💻', furniture: '🪑', other: '📦' };
    return map[c] || '📦';
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Surplus Marketplace</h1>
          <p>Browse and request surplus resources from other NGOs</p>
        </div>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="filter-bar glass-card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="input-wrapper">
            <HiOutlineSearch className="input-icon" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <div className="filter-group">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="food">🍲 Food</option>
            <option value="clothing">👕 Clothing</option>
            <option value="medical">💊 Medical</option>
            <option value="education">📚 Education</option>
            <option value="electronics">💻 Electronics</option>
            <option value="furniture">🪑 Furniture</option>
            <option value="other">📦 Other</option>
          </select>
          <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="all">All Urgency</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner"></div></div>
      ) : listings.length === 0 ? (
        <div className="empty-card">
          <h3>No listings found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="card-grid">
          {listings.map((listing) => (
            <div key={listing._id} className="listing-card glass-card">
              <div className="listing-header">
                <span className="listing-category">{categoryEmoji(listing.category)} {listing.category}</span>
                <span className={`badge badge-${urgencyColor(listing.urgency)}`}>
                  <HiOutlineClock /> {listing.urgency}
                </span>
              </div>
              <h3 className="listing-title">{listing.title}</h3>
              <p className="listing-desc">{listing.description}</p>
              <div className="listing-meta">
                <span><HiOutlineTag /> Qty: {listing.quantity}</span>
                <span>By: <Link to={`/ngo/${listing.ownerNgoId?._id}`} className="ngo-link">{listing.ownerNgoId?.profileDetails?.name}</Link></span>
              </div>
              {user.role === 'ngo' && (
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => openRequestModal(listing)}
                  disabled={requestingId === listing._id}
                >
                  <HiOutlineHand /> Request Item
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h2>Request Item</h2>
            <p>You're requesting: <strong>{selectedListing?.title}</strong></p>
            <div className="form-group">
              <label>Message (optional)</label>
              <textarea
                placeholder="Explain why you need this item..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRequest} disabled={!!requestingId}>
                {requestingId ? <span className="spinner-sm"></span> : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
