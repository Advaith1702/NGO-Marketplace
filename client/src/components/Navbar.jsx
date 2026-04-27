import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLogout, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const getNavLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard' },
        ];
      case 'ngo':
        return [
          { to: '/ngo/dashboard', label: 'Dashboard' },
          { to: '/marketplace', label: 'Marketplace' },
          { to: '/ngo/listings', label: 'My Listings' },
          { to: '/ngo/create-listing', label: 'New Listing' },
        ];
      case 'donor':
        return [
          { to: '/donor/dashboard', label: 'Dashboard' },
          { to: '/donor/explore', label: 'Explore NGOs' },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🤝</span>
          <span className="brand-text">NGO<span className="brand-highlight">Connect</span></span>
        </Link>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
        </button>

        <div className={`navbar-links ${mobileOpen ? 'active' : ''}`}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="nav-user">
            {user.role === 'ngo' ? (
              <Link to={`/ngo/${user._id}`} className="nav-user-name ngo-link" onClick={() => setMobileOpen(false)}>
                {user.profileDetails?.name || user.email}
              </Link>
            ) : (
              <span className="nav-user-name">{user.profileDetails?.name || user.email}</span>
            )}
            <span className={`nav-role-badge ${user.role}`}>{user.role.toUpperCase()}</span>
            <button className="nav-logout" onClick={handleLogout} title="Logout">
              <HiOutlineLogout />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
