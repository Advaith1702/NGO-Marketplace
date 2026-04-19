import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNgo, createDonation, getListings } from '../api';
import {
  HiOutlineHeart,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineClipboardList,
  HiOutlineCurrencyDollar,
  HiOutlineBadgeCheck,
  HiOutlineTag,
  HiOutlineArrowLeft,
} from 'react-icons/hi';

const NgoProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Donate modal state
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [donating, setDonating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchNgo = async () => {
      try {
        const { data } = await getNgo(id);
        setNgo(data);

        // Also fetch NGO listings (optional enhancement)
        try {
          const listingsRes = await getListings({ ownerNgoId: id });
          setListings(listingsRes.data || []);
        } catch {
          // Listings fetch is optional, ignore errors
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load NGO profile');
      } finally {
        setLoading(false);
      }
    };
    fetchNgo();
  }, [id]);

  const openDonateModal = () => {
    setAmount('');
    setMessage('');
    setShowModal(true);
  };

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) < 1) return alert('Enter a valid amount');
    setDonating(true);
    try {
      await createDonation({ ngoId: ngo._id, amount: parseFloat(amount), message });
      setShowModal(false);
      setSuccessMsg(`Donated ₹${parseFloat(amount).toLocaleString()} to ${ngo.profileDetails?.name}!`);
      // Update stats locally
      setNgo((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalDonations: (prev.stats?.totalDonations || 0) + parseFloat(amount),
        },
      }));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Donation failed');
    } finally {
      setDonating(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="empty-card">
          <h3>{error}</h3>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <HiOutlineArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const profile = ngo.profileDetails || {};
  const stats = ngo.stats || {};

  return (
    <div className="dashboard-page ngo-profile-page">
      {/* Back button */}
      <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
        <HiOutlineArrowLeft /> Back
      </button>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Profile Header */}
      <div className="ngo-profile-header glass-card">
        <div className="ngo-profile-avatar">
          {profile.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="ngo-profile-info">
          <div className="ngo-profile-name-row">
            <h1>{profile.name}</h1>
            {ngo.isVerified && (
              <span className="badge badge-success"><HiOutlineBadgeCheck /> Verified</span>
            )}
            {ngo.isRestricted && (
              <span className="badge badge-danger">Restricted</span>
            )}
          </div>
          {profile.category && (
            <span className="badge badge-category ngo-profile-category">
              <HiOutlineTag /> {profile.category}
            </span>
          )}
          <p className="ngo-profile-description">{profile.description || 'No description provided.'}</p>
          <div className="ngo-profile-meta">
            {profile.contact && (
              <span className="meta-item">
                <HiOutlinePhone /> {profile.contact}
              </span>
            )}
            {ngo.email && (
              <span className="meta-item">
                <HiOutlineMail /> {ngo.email}
              </span>
            )}
            {profile.registrationId && (
              <span className="meta-item">
                <HiOutlineIdentification /> {profile.registrationId}
              </span>
            )}
          </div>
          <p className="ngo-profile-joined">Member since {new Date(ngo.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="ngo-profile-stats">
        <div className="stat-card glass-card">
          <HiOutlineClipboardList className="stat-icon" />
          <div className="stat-value">{stats.listingsCount ?? 0}</div>
          <div className="stat-label">Listings Created</div>
        </div>
        <div className="stat-card glass-card">
          <HiOutlineCurrencyDollar className="stat-icon" />
          <div className="stat-value">₹{(stats.totalDonations ?? 0).toLocaleString()}</div>
          <div className="stat-label">Total Donations</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="ngo-profile-actions">
        <button className="btn btn-primary btn-lg" onClick={openDonateModal}>
          <HiOutlineHeart /> Donate to {profile.name}
        </button>
      </div>

      {/* NGO Listings */}
      {listings.length > 0 && (
        <div className="ngo-profile-listings">
          <h2>Active Listings</h2>
          <div className="card-grid">
            {listings.map((listing) => (
              <div key={listing._id} className="listing-card glass-card">
                <div className="listing-card-header">
                  <h3>{listing.title}</h3>
                  <span className={`badge badge-${listing.urgency === 'high' ? 'danger' : listing.urgency === 'medium' ? 'warning' : 'info'}`}>
                    {listing.urgency} priority
                  </span>
                </div>
                <p className="listing-desc">{listing.description}</p>
                <div className="listing-card-meta">
                  <span className="badge badge-category">{listing.category}</span>
                  <span className="listing-qty">Qty: {listing.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h2>Donate to {profile.name}</h2>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" min="1" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="quick-amounts">
              {[100, 500, 1000, 5000].map((a) => (
                <button key={a} type="button" className={`quick-amount-btn ${amount === String(a) ? 'active' : ''}`} onClick={() => setAmount(String(a))}>₹{a}</button>
              ))}
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea placeholder="Optional message..." value={message} onChange={(e) => setMessage(e.target.value)} rows={2} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleDonate} disabled={donating}>
                {donating ? 'Processing...' : `Donate ₹${amount || '0'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoProfile;
