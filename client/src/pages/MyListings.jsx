import { useState, useEffect } from 'react';
import { getMyListings, deleteListing } from '../api';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineClock, HiOutlineTag } from 'react-icons/hi';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data } = await getMyListings();
      setListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteListing(id);
      fetchListings();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'all' ? listings : listings.filter((l) => l.status === filter);

  const statusColor = (s) => {
    switch (s) {
      case 'available': return 'success';
      case 'pending': return 'warning';
      case 'claimed': return 'info';
      default: return 'default';
    }
  };

  const categoryEmoji = (c) => {
    const map = { food: '🍲', clothing: '👕', medical: '💊', education: '📚', electronics: '💻', furniture: '🪑', other: '📦' };
    return map[c] || '📦';
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>My Listings</h1>
          <p>Manage your surplus item listings</p>
        </div>
        <Link to="/ngo/create-listing" className="btn btn-primary">
          <HiOutlinePlus /> New Listing
        </Link>
      </div>

      <div className="tabs">
        {['all', 'available', 'pending', 'claimed'].map((f) => (
          <button
            key={f}
            className={`tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && <span className="tab-count">{listings.filter((l) => l.status === f).length}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-card">
          <h3>No listings found</h3>
          <p>{filter === 'all' ? 'Create your first surplus listing to share with other NGOs.' : `No ${filter} listings.`}</p>
          {filter === 'all' && (
            <Link to="/ngo/create-listing" className="btn btn-primary">
              <HiOutlinePlus /> Create Listing
            </Link>
          )}
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((listing) => (
            <div key={listing._id} className="listing-card glass-card">
              <div className="listing-header">
                <span className="listing-category">{categoryEmoji(listing.category)} {listing.category}</span>
                <span className={`badge badge-${statusColor(listing.status)}`}>
                  {listing.status}
                </span>
              </div>
              <h3 className="listing-title">{listing.title}</h3>
              <p className="listing-desc">{listing.description}</p>
              <div className="listing-meta">
                <span><HiOutlineTag /> Qty: {listing.quantity}</span>
                <span><HiOutlineClock /> {listing.urgency} urgency</span>
              </div>
              <div className="listing-meta">
                <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
              </div>
              {listing.status === 'available' && (
                <div className="listing-actions">
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(listing._id)}>
                    <HiOutlineTrash /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
