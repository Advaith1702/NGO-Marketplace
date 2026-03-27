import { useState, useEffect } from 'react';
import { getMyDonations } from '../api';
import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineCurrencyDollar, HiOutlineClipboardList } from 'react-icons/hi';

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const { data } = await getMyDonations();
        setDonations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Donor Dashboard</h1>
          <p>Your impact at a glance</p>
        </div>
        <Link to="/donor/explore" className="btn btn-primary">
          <HiOutlineHeart /> Explore NGOs
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <HiOutlineCurrencyDollar />
          </div>
          <div className="stat-info">
            <span className="stat-value">₹{totalDonated.toLocaleString()}</span>
            <span className="stat-label">Total Donated</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <HiOutlineHeart />
          </div>
          <div className="stat-info">
            <span className="stat-value">{donations.length}</span>
            <span className="stat-label">Donations Made</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <HiOutlineClipboardList />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {new Set(donations.map(d => d.ngoId?._id)).size}
            </span>
            <span className="stat-label">NGOs Supported</span>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Donation History</h2>
        {donations.length === 0 ? (
          <div className="empty-card">
            <h3>No donations yet</h3>
            <p>Explore verified NGOs and make your first donation!</p>
            <Link to="/donor/explore" className="btn btn-primary">
              <HiOutlineHeart /> Explore NGOs
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>NGO</th>
                  <th>Amount</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id}>
                    <td>{d.ngoId?.profileDetails?.name || 'Unknown'}</td>
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
    </div>
  );
};

export default DonorDashboard;
