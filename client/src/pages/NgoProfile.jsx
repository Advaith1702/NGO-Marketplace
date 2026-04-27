import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNgo, createDonation, getListings, updateMyNgoProfile } from '../api';
import { useAuth } from '../context/AuthContext';
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
  HiOutlinePencil,
} from 'react-icons/hi';

const NgoProfile = () => {
  const MAX_DONATION_AMOUNT = 10000000;
  const NGO_CATEGORIES = ['Healthcare', 'Education', 'Environment', 'Food Relief', 'Others'];
  const { user, refreshUser } = useAuth();
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    registrationId: '',
    contact: '',
    category: '',
  });

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

  const openEditModal = () => {
    setEditError('');
    setEditForm({
      name: ngo?.profileDetails?.name || '',
      description: ngo?.profileDetails?.description || '',
      registrationId: ngo?.profileDetails?.registrationId || '',
      contact: ngo?.profileDetails?.contact || '',
      category: ngo?.profileDetails?.category || '',
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editForm.name.trim()) {
      setEditError('Organization name is required');
      return;
    }

    setEditing(true);
    setEditError('');
    try {
      await updateMyNgoProfile({
        description: editForm.description,
        registrationId: editForm.registrationId,
        contact: editForm.contact,
        category: editForm.category,
      });

      const [{ data: refreshedNgo }] = await Promise.all([
        getNgo(id),
        refreshUser(),
      ]);

      setNgo(refreshedNgo);
      setShowEditModal(false);
      setSuccessMsg('Profile updated successfully. Your account is now pending admin reverification.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditing(false);
    }
  };

  const handleDonate = async () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount < 1) return alert('Enter a valid amount');
    if (numericAmount > MAX_DONATION_AMOUNT) return alert(`Maximum donation is ₹${MAX_DONATION_AMOUNT.toLocaleString('en-IN')}`);
    setDonating(true);
    try {
      await createDonation({ ngoId: ngo._id, amount: numericAmount, message });
      setShowModal(false);
      setSuccessMsg(`Donated ₹${numericAmount.toLocaleString()} to ${ngo.profileDetails?.name}!`);
      // Update stats locally
      setNgo((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalDonations: (prev.stats?.totalDonations || 0) + numericAmount,
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
  const canDonate = user?.role === 'donor';
  const isOwnNgoProfile = user?.role === 'ngo' && user?._id === id;

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
            {!ngo.isVerified && ngo.pendingReverification && (
              <span className="badge badge-warning">Awaiting Reverification</span>
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
      {(canDonate || isOwnNgoProfile) && (
        <div className="ngo-profile-actions">
          {canDonate && (
            <button className="btn btn-primary btn-lg" onClick={openDonateModal}>
              <HiOutlineHeart /> Donate to {profile.name}
            </button>
          )}
          {isOwnNgoProfile && (
            <button className="btn btn-outline btn-lg" onClick={openEditModal}>
              <HiOutlinePencil /> Edit Profile
            </button>
          )}
        </div>
      )}

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
      {canDonate && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h2>Donate to {profile.name}</h2>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" min="1" max={MAX_DONATION_AMOUNT} placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
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

      {/* Edit Profile Modal */}
      {isOwnNgoProfile && showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h2>Edit NGO Profile</h2>
            {editError && <div className="alert alert-error">{editError}</div>}
            <div className="form-group">
              <label>Organization Name</label>
              <input
                type="text"
                value={editForm.name}
                disabled
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Select category</option>
                {NGO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Registration ID</label>
              <input
                type="text"
                value={editForm.registrationId}
                onChange={(e) => setEditForm((prev) => ({ ...prev, registrationId: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input
                type="text"
                value={editForm.contact}
                onChange={(e) => setEditForm((prev) => ({ ...prev, contact: e.target.value }))}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowEditModal(false)} disabled={editing}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleEditSave} disabled={editing}>
                {editing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <p className="auth-note">
              Updating profile details requires admin approval. Your NGO will be marked unverified until reapproved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoProfile;
