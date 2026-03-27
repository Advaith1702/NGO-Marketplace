import { useState, useEffect } from 'react';
import { getAdminNgos, getAdminStats, verifyNgo, restrictNgo } from '../api';
import { HiOutlineCheckCircle, HiOutlineBan, HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineCurrencyDollar } from 'react-icons/hi';

const AdminDashboard = () => {
  const [ngos, setNgos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const fetchData = async () => {
    try {
      const [ngosRes, statsRes] = await Promise.all([getAdminNgos(), getAdminStats()]);
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage NGO verifications and platform integrity</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">
              <HiOutlineUserGroup />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalNgos}</span>
              <span className="stat-label">Total NGOs</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <HiOutlineShieldCheck />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.verifiedNgos}</span>
              <span className="stat-label">Verified NGOs</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">
              <HiOutlineClipboardList />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalListings}</span>
              <span className="stat-label">Total Listings</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber">
              <HiOutlineCurrencyDollar />
            </div>
            <div className="stat-info">
              <span className="stat-value">₹{stats.totalDonations.toLocaleString()}</span>
              <span className="stat-label">Total Donations</span>
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <h2>NGO Management</h2>
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
              {ngos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">No NGOs registered yet</td>
                </tr>
              ) : (
                ngos.map((ngo) => (
                  <tr key={ngo._id}>
                    <td>
                      <div className="table-user">
                        <span className="table-user-name">{ngo.profileDetails?.name}</span>
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
                        {ngo.isRestricted && (
                          <span className="badge badge-danger">Restricted</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className={`btn btn-sm ${ngo.isVerified ? 'btn-outline' : 'btn-success'}`}
                          onClick={() => handleVerify(ngo._id)}
                          disabled={actionLoading === ngo._id + '-verify'}
                        >
                          <HiOutlineCheckCircle />
                          {ngo.isVerified ? 'Unverify' : 'Verify'}
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
