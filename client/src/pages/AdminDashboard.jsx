import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminNgos, getAdminDashboardAnalytics, verifyNgo, restrictNgo } from '../api';
import { HiOutlineCheckCircle, HiOutlineBan, HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineHeart } from 'react-icons/hi';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [ngos, setNgos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [ngosRes, statsRes] = await Promise.all([getAdminNgos(), getAdminDashboardAnalytics()]);
      setNgos(ngosRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (id) => {
    setActionLoading(id + '-verify');
    try {
      await verifyNgo(id);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  };

  const handleRestrict = async (id) => {
    setActionLoading(id + '-restrict');
    try {
      await restrictNgo(id);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredNgos = ngos.filter((ngo) => {
    if (!normalizedSearch) return true;
    const name = ngo.profileDetails?.name?.toLowerCase() || '';
    const email = ngo.email?.toLowerCase() || '';
    const registrationId = ngo.profileDetails?.registrationId?.toLowerCase() || '';
    return (
      name.includes(normalizedSearch) ||
      email.includes(normalizedSearch) ||
      registrationId.includes(normalizedSearch)
    );
  });
  const sortedNgos = [...filteredNgos].sort((a, b) => {
    if (a.pendingReverification === b.pendingReverification) return 0;
    return a.pendingReverification ? -1 : 1;
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage NGO verifications and platform integrity</p>
      </div>

      {stats && (
        <div className="analytics-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple"><HiOutlineUserGroup /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalNgos}</span>
                <span className="stat-label">Total NGOs</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><HiOutlineHeart /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalDonors}</span>
                <span className="stat-label">Total Donors</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><HiOutlineClipboardList /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.completedListings}</span>
                <span className="stat-label">Completed Listings</span>
              </div>
            </div>
            {stats.topNgo && (
              <div className="stat-card">
                <div className="stat-icon amber"><FaIndianRupeeSign /></div>
                <div className="stat-info">
                  <span className="stat-value">₹{stats.topNgo.totalDonations.toLocaleString()}</span>
                  <span className="stat-label">Top NGO: {stats.topNgo.name}</span>
                </div>
              </div>
            )}
          </div>

          <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem', marginBottom: '2rem' }}>
            <div className="chart-card glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Donation Trend</h3>
              <div style={{ height: '300px' }}>
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
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Listings by Category</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.listingsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="category" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="count" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <h2>NGO Management</h2>
        <div className="filter-bar glass-card" style={{ marginBottom: '1rem' }}>
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Search by NGO name, email, or registration ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Email</th>
                <th>Reg. ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNgos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    {ngos.length === 0 ? 'No NGOs registered yet' : 'No NGOs match your search'}
                  </td>
                </tr>
              ) : (
                sortedNgos.map((ngo) => (
                  <tr key={ngo._id}>
                    <td>
                      <div className="table-user">
                        <Link to={`/ngo/${ngo._id}`} className="ngo-link"><span className="table-user-name">{ngo.profileDetails?.name}</span></Link>
                        <span className="table-user-desc">{ngo.profileDetails?.description?.substring(0, 50)}</span>
                      </div>
                    </td>
                    <td>{ngo.email}</td>
                    <td><code>{ngo.profileDetails?.registrationId || '—'}</code></td>
                    <td>
                      <div className="status-badges">
                        {ngo.isVerified ? (
                          <span className="badge badge-success">Verified</span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                        {ngo.pendingReverification && (
                          <span className="badge badge-info">Reverification Pending</span>
                        )}
                        {ngo.isRestricted && (
                          <span className="badge badge-danger">Restricted</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className={`btn btn-sm ${ngo.pendingReverification ? 'btn-primary' : ngo.isVerified ? 'btn-outline' : 'btn-success'}`}
                          onClick={() => handleVerify(ngo._id)}
                          disabled={actionLoading === ngo._id + '-verify'}
                        >
                          <HiOutlineCheckCircle />
                          {ngo.pendingReverification ? 'Reverify' : ngo.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                          className={`btn btn-sm ${ngo.isRestricted ? 'btn-warning' : 'btn-danger'}`}
                          onClick={() => handleRestrict(ngo._id)}
                          disabled={actionLoading === ngo._id + '-restrict'}
                        >
                          <HiOutlineBan />
                          {ngo.isRestricted ? 'Unrestrict' : 'Restrict'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
