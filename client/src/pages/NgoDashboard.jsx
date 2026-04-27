import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyListings, getIncomingRequests, getReceivedDonations, acceptRequest, rejectRequest, getNgoDashboardAnalytics } from '../api';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineClipboardList, HiOutlineBell, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamation } from 'react-icons/hi';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NgoDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    try {
      if (user.isVerified && !user.isRestricted) {
        const [listRes, reqRes, donRes, statsRes] = await Promise.all([
          getMyListings(),
          getIncomingRequests(),
          getReceivedDonations(),
          getNgoDashboardAnalytics(),
        ]);
        setListings(listRes.data);
        setRequests(reqRes.data);
        setDonations(donRes.data);
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id) => {
    try {
      await acceptRequest(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRequest(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  if (!user.isVerified) {
    return (
      <div className="dashboard-page">
        <div className="status-banner warning">
          <HiOutlineExclamation className="banner-icon" />
          <div>
            <h2>Verification Pending</h2>
            <p>Your NGO account is awaiting admin verification. You'll be able to access all marketplace features once verified.</p>
          </div>
        </div>
        <div className="profile-card glass-card">
          <h3>{user.profileDetails?.name}</h3>
          <p>{user.profileDetails?.description}</p>
          <div className="profile-details">
            <span>📧 {user.email}</span>
            {user.profileDetails?.registrationId && <span>🆔 {user.profileDetails.registrationId}</span>}
            {user.profileDetails?.contact && <span>📞 {user.profileDetails.contact}</span>}
          </div>
        </div>
      </div>
    );
  }

  if (user.isRestricted) {
    return (
      <div className="dashboard-page">
        <div className="status-banner danger">
          <HiOutlineBell className="banner-icon" />
          <div>
            <h2>Account Restricted</h2>
            <p>Your NGO account has been restricted by an administrator. Please contact support for more information.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user.profileDetails?.name}</h1>
          <p>Manage your surplus listings and incoming requests</p>
        </div>
        <Link to="/ngo/create-listing" className="btn btn-primary">
          <HiOutlinePlus /> New Listing
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <HiOutlineClipboardList />
          </div>
          <div className="stat-info">
            <span className="stat-value">{listings.length}</span>
            <span className="stat-label">My Listings</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">
            <HiOutlineBell />
          </div>
          <div className="stat-info">
            <span className="stat-value">{pendingRequests.length}</span>
            <span className="stat-label">Pending Requests</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <FaIndianRupeeSign />
          </div>
          <div className="stat-info">
            <span className="stat-value">₹{totalDonations.toLocaleString()}</span>
            <span className="stat-label">Donations Received</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Requests</button>
        <button className={`tab ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>Donation Ledger</button>
      </div>

      {activeTab === 'overview' && (
        <div className="section">
          {stats && (
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              <div className="chart-card glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Donation Trend</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.donationTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="var(--text-secondary)" />
                      <YAxis stroke="var(--text-secondary)" />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }} />
                      <Line type="monotone" dataKey="total" stroke="var(--accent-green)" strokeWidth={3} dot={{ fill: 'var(--accent-green)', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Listings by Status</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.listingsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="status" stroke="var(--text-secondary)" />
                      <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Bar dataKey="count" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          <h2>Incoming Requests {pendingRequests.length > 0 && <span className="count-badge">{pendingRequests.length}</span>}</h2>
          {requests.length === 0 ? (
            <div className="empty-card">
              <p>No requests received yet. Your surplus listings will attract other NGOs!</p>
            </div>
          ) : (
            <div className="request-list">
              {requests.map((req) => (
                <div key={req._id} className={`request-card glass-card status-${req.status}`}>
                  <div className="request-info">
                    <h4>{req.listingId?.title || 'Listing'}</h4>
                    <p className="request-from">From: <Link to={`/ngo/${req.requestingNgoId?._id}`} className="ngo-link"><strong>{req.requestingNgoId?.profileDetails?.name}</strong></Link></p>
                    {req.message && <p className="request-message">"{req.message}"</p>}
                    <span className={`badge badge-${req.status === 'pending' ? 'warning' : req.status === 'accepted' ? 'success' : 'danger'}`}>
                      {req.status}
                    </span>
                  </div>
                  {req.status === 'pending' && (
                    <div className="request-actions">
                      <button className="btn btn-success btn-sm" onClick={() => handleAccept(req._id)}>
                        <HiOutlineCheckCircle /> Accept
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleReject(req._id)}>
                        <HiOutlineXCircle /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'donations' && (
        <div className="section">
          <h2>Donation Ledger</h2>
          {donations.length === 0 ? (
            <div className="empty-card">
              <p>No donations received yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Amount</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d._id}>
                      <td>{d.donorId?.profileDetails?.name || 'Anonymous'}</td>
                      <td className="amount">₹{d.amount.toLocaleString()}</td>
                      <td>{d.message || '—'}</td>
                      <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td><span className="badge badge-success">{d.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NgoDashboard;
