import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVerifiedNgos, createDonation } from '../api';
import { HiOutlineSearch, HiOutlineHeart, HiOutlineEye, HiOutlineFilter } from 'react-icons/hi';

const NGO_CATEGORIES = ['Healthcare', 'Education', 'Environment', 'Food Relief', 'Others'];

const DonorExplore = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [donating, setDonating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const fetchNgos = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await getVerifiedNgos(params);
      setNgos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNgos(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchNgos();
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setLoading(true);
    // We need to call fetchNgos after state update, so use a small trick
    setTimeout(() => {}, 0);
  };

  // Re-fetch when category changes
  useEffect(() => {
    setLoading(true);
    fetchNgos();
  }, [category]);

  const openDonateModal = (ngo) => {
    setSelectedNgo(ngo);
    setAmount('');
    setMessage('');
    setShowModal(true);
  };

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) < 1) return alert('Enter a valid amount');
    setDonating(true);
    try {
      await createDonation({ ngoId: selectedNgo._id, amount: parseFloat(amount), message });
      setShowModal(false);
      setSuccessMsg(`Donated ₹${parseFloat(amount).toLocaleString()} to ${selectedNgo.profileDetails?.name}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Donation failed');
    } finally {
      setDonating(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Explore NGOs</h1>
        <p>Find and support verified organizations</p>
      </div>
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      <div className="filter-bar glass-card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="input-wrapper">
            <HiOutlineSearch className="input-icon" />
            <input type="text" placeholder="Search NGOs..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="input-wrapper category-select-wrapper">
            <HiOutlineFilter className="input-icon" />
            <select
              id="category-filter"
              value={category}
              onChange={handleCategoryChange}
              className="category-select"
            >
              <option value="">All Categories</option>
              {NGO_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>
      {ngos.length === 0 ? (
        <div className="empty-card"><h3>No NGOs found</h3><p>Try adjusting your search or category filter.</p></div>
      ) : (
        <div className="card-grid">
          {ngos.map((ngo) => (
            <div key={ngo._id} className="ngo-card glass-card">
              <div className="ngo-avatar">{ngo.profileDetails?.name?.charAt(0)?.toUpperCase()}</div>
              <h3>{ngo.profileDetails?.name}</h3>
              <p className="ngo-desc">{ngo.profileDetails?.description || 'No description.'}</p>
              <div className="ngo-card-badges">
                <span className="badge badge-success">✓ Verified</span>
                {ngo.profileDetails?.category && (
                  <span className="badge badge-category">{ngo.profileDetails.category}</span>
                )}
              </div>
              <div className="ngo-card-actions">
                <button className="btn btn-primary" onClick={() => openDonateModal(ngo)}>
                  <HiOutlineHeart /> Donate
                </button>
                <button className="btn btn-outline" onClick={() => navigate(`/ngo/${ngo._id}`)}>
                  <HiOutlineEye /> View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h2>Donate to {selectedNgo?.profileDetails?.name}</h2>
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

export default DonorExplore;
