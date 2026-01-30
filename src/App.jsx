import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import RegistrationSelection from './pages/RegistrationSelection';
import AadhaarRegistration from './pages/AadhaarRegistration';
import DrivingLicenceRegistration from './pages/DrivingLicenceRegistration';
import EmergencyCard from './pages/EmergencyCard';
import EditProfile from './pages/EditProfile';
import QRCodeDisplay from './pages/QRCodeDisplay';
import Features from './pages/Features';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PatientLogin from './pages/PatientLogin';

// SVG Icons
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
);
const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

// Home Page Component
const Home = ({ serverStatus }) => {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');

  const patientId = localStorage.getItem('patientId');
  const patientNameLocal = localStorage.getItem('patientName') || 'VEERENDRA';

  useEffect(() => {
    try {
      if (!patientId) {
        // Logged out: Show masked ID
        setCardNumber('6078 **** **** ****');
        // Guest expiry
        const now = new Date();
        const expDate = new Date(now.setFullYear(now.getFullYear() + 5));
        const mm = String(expDate.getMonth() + 1).padStart(2, '0');
        const yy = String(expDate.getFullYear()).slice(-2);
        setExpiry(`${mm}/${yy}`);
      } else {
        // Logged in: Show actual ID
        const storedNumber = localStorage.getItem(`cardNumber_${patientId}`);
        const storedExpiry = localStorage.getItem(`cardExpiry_${patientId}`);

        if (storedNumber) setCardNumber(storedNumber);
        else {
          // Fallback if missing (should be set by login)
          const num = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
          const formatted = `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8, 12)} ${num.slice(12, 16)}`;
          setCardNumber(formatted);
          localStorage.setItem(`cardNumber_${patientId}`, formatted);
        }

        if (storedExpiry) setExpiry(storedExpiry);
        else {
          const now = new Date();
          const expDate = new Date(now.setFullYear(now.getFullYear() + 5));
          const mm = String(expDate.getMonth() + 1).padStart(2, '0');
          const yy = String(expDate.getFullYear()).slice(-2);
          const exp = `${mm}/${yy}`;
          setExpiry(exp);
          localStorage.setItem(`cardExpiry_${patientId}`, exp);
        }
      }
    } catch (err) {
      console.error('Card generation error', err);
    }
  }, [patientId]);

  return (
    <>
      {/* Hero Section */}
      <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-cream)', minHeight: '60vh', display: 'flex', alignItems: 'flex-start' }}>
        <div className="container grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          {/* Pill across both columns, centered */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 28px',
              backgroundColor: 'var(--color-primary-dark)',
              borderRadius: '50px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              width: 'fit-content'
            }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white' }} />
              <span style={{ fontSize: '0.98rem', color: 'white', fontWeight: '600', textAlign: 'center' }}>
                Empowering Healthcare with Digital Innovation
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>

            <h2 style={{ fontSize: '3.5rem', margin: '0 0 5px 0', lineHeight: '1.1', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
              Right Information.<br />to the Right Hands.<br />at the Right Time.
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '500px' }}>
              JeevanRaksha: Your Digital Medical Guardian. During critical emergencies, up to 30% of treatment errors occur because doctors don't know a patient's medical history. JeevanRaksha solves this by providing instant, secure access to vital health data—even when the patient is unconscious or the phone is locked.            </p>
            <div className="flex gap-4">
              <button
                className="btn btn-primary"
                style={{ padding: '15px 25px', fontSize: '1.1rem' }}
                onClick={() => navigate('/register')}
              >
                Get Your Card
              </button>
              <button className="btn btn-danger" style={{ padding: '15px 35px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ActivityIcon /> Emergency Access
              </button>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#666' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: serverStatus === 'Online' ? 'var(--color-success)' : 'var(--color-warning)' }}></span>
              System Status: <strong>{serverStatus}</strong>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
              borderRadius: '24px',
              padding: '40px',
              color: 'white',
              boxShadow: 'var(--shadow-lg)',
              transform: 'rotate(-2deg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', opacity: 0.9 }}>Digital Health Card</h3>
                  <span style={{ opacity: 0.7 }}>Universal ID</span>
                </div>
                <ShieldIcon />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '6px' }}>Card Number</div>
                <div style={{ fontSize: '2rem', letterSpacing: '4px', fontWeight: '500', marginBottom: '8px' }}>
                  {cardNumber || '---- ---- ---- ----'}
                </div>
                <div style={{ fontSize: '0.95rem', opacity: 0.85 }}>Expiry {expiry}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '600', letterSpacing: '2px' }}>{(patientNameLocal || 'VEERENDRA').toUpperCase()}</div>
                <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '4px' }}></div> {/* QR Code Placeholder */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 0', backgroundColor: 'white' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '60px', maxWidth: '700px', margin: '0 auto 60px auto' }}>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '20px' }}>Complete Health Ecosystem</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              We connect patients, doctors, and emergency services in a seamless, secure network.
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div className="card">
              <div style={{ color: 'var(--color-primary)', marginBottom: '20px' }}><HeartIcon /></div>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>Unified Records</h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                No more lost prescriptions. Upload and organize lab reports, prescriptions, and scans in one secure vault.
              </p>
            </div>
            <div className="card">
              <div style={{ color: 'var(--color-danger)', marginBottom: '20px' }}><ActivityIcon /></div>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>Emergency Response</h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                Paramedics can scan your card to see allergies and blood type instantly, even if you are unconscious.
              </p>
            </div>
            <div className="card">
              <div style={{ color: 'var(--color-success)', marginBottom: '20px' }}><ShieldIcon /></div>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>Bank-Grade Security</h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                Your data is encrypted end-to-end. You decide who gets access and for how long.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...');

  useEffect(() => {
    // Check backend health (updated port to 5001)
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health`)
      .then(res => res.json())
      .then(data => setServerStatus(data.status))
      .catch((err) => {
        console.error(err);
        setServerStatus('Offline');
      });
  }, []);

  return (
    <BrowserRouter>
      <AppContent serverStatus={serverStatus} />
    </BrowserRouter>
  );
}

// Separate component to use useLocation inside BrowserRouter
function AppContent({ serverStatus }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Scroll to top when route changes or on refresh to ensure pages load from start
  // Scroll to top when route changes or on refresh
  useEffect(() => {
    // Disable browser's default scroll restoration to ensure we always start at top
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // scroll to top immediate
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Check if user is logged in
  const patientToken = localStorage.getItem('patientToken');
  const adminToken = localStorage.getItem('adminToken');
  const isLoggedIn = patientToken || adminToken;
  const isAdmin = adminToken ? true : false;
  const adminRole = localStorage.getItem('adminRole');
  const patientName = localStorage.getItem('patientName');
  const patientId = localStorage.getItem('patientId');
  const adminUsername = localStorage.getItem('adminUsername');

  const handleLogout = () => {
    localStorage.removeItem('patientToken');
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientName');
    localStorage.removeItem('patientEmail');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminPermissions');
    setShowProfileMenu(false);
    navigate('/');
    window.location.reload();
  };

  // Check if current route is admin route or if admin is viewing edit profile
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isEditProfile = location.pathname.startsWith('/edit-profile');
  const hideHeaderFooter = isAdminRoute || (isAdmin && isEditProfile);

  return (
    <div className="app">
      {/* Header - Hide for admin routes or admin editing profile */}
      {!hideHeaderFooter && (
        <header style={{ backgroundColor: 'var(--color-primary-dark)', padding: '20px 0', borderBottom: 'none', position: 'sticky', top: 0, zIndex: 100 }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/Logo.png"
                alt="JeevanRaksha Logo"
                style={{ height: '50px', width: 'auto' }}
              />
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', margin: 0 }}>JeevanRaksha</h1>
            </Link>
            <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <Link to="/" style={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: '600',
                fontSize: '1rem',
                paddingBottom: '5px',
                borderBottom: location.pathname === '/' ? '2px solid white' : '2px solid transparent'
              }}>Home</Link>
              <Link to="/features" style={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: '600',
                fontSize: '1rem',
                paddingBottom: '5px',
                borderBottom: location.pathname === '/features' ? '2px solid white' : '2px solid transparent'
              }}>Features</Link>
              <Link to="/contact" style={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: '600',
                fontSize: '1rem',
                paddingBottom: '5px',
                borderBottom: location.pathname === '/contact' ? '2px solid white' : '2px solid transparent'
              }}>Contact</Link>
            </nav>

            {/* Profile or Register/Login */}
            {isLoggedIn ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: 'var(--color-primary-dark)',
                    fontWeight: '700'
                  }}
                >
                  {isAdmin ? (adminUsername ? adminUsername[0].toUpperCase() : 'A') : (patientName ? patientName[0].toUpperCase() : 'U')}
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '55px',
                    right: '0',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    padding: '20px',
                    minWidth: '280px',
                    zIndex: 1000
                  }}>
                    {/* User Info */}
                    <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.3rem',
                          fontWeight: '700'
                        }}>
                          {isAdmin ? (adminUsername ? adminUsername[0].toUpperCase() : 'A') : (patientName ? patientName[0].toUpperCase() : 'U')}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>
                            {isAdmin ? adminUsername : patientName}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                            {isAdmin ? (adminRole === 'superadmin' ? 'Super Admin' : 'Admin') : 'Patient'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {!isAdmin && (
                        <>
                          <Link
                            to={`/emergency-card/${patientId}`}
                            onClick={() => setShowProfileMenu(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              color: '#333',
                              backgroundColor: '#f5f5f5',
                              transition: 'background 0.2s'
                            }}
                          >
                            <span>🏥</span> My Health Card
                          </Link>
                          <Link
                            to={`/qr-code/${patientId}`}
                            onClick={() => setShowProfileMenu(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              color: '#333',
                              backgroundColor: '#f5f5f5'
                            }}
                          >
                            <span>📱</span> My QR Code
                          </Link>
                          <Link
                            to={`/edit-profile/${patientId}`}
                            onClick={() => setShowProfileMenu(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              color: '#333',
                              backgroundColor: '#f5f5f5'
                            }}
                          >
                            <span>📋</span> My Medical Profile
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <Link
                          to={adminRole === 'superadmin' ? '/admin/superadmin-dashboard' : '/admin/dashboard'}
                          onClick={() => setShowProfileMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: '#333',
                            backgroundColor: '#f5f5f5'
                          }}
                        >
                          <span>⚙️</span> Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#fee',
                          color: '#c33',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          marginTop: '5px'
                        }}
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Link to="/login" style={{ textDecoration: 'none', backgroundColor: 'white', color: 'var(--color-primary-dark)', padding: '8px 18px', borderRadius: '6px', fontWeight: '600' }}>Login</Link>
                <Link to="/register" style={{ textDecoration: 'none', backgroundColor: 'white', color: 'var(--color-primary-dark)', padding: '8px 18px', borderRadius: '6px', fontWeight: '600' }}>Register</Link>
              </div>
            )}
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={<Home serverStatus={serverStatus} />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<PatientLogin />} />
        <Route path="/register" element={<RegistrationSelection />} />
        <Route path="/register/aadhaar" element={<AadhaarRegistration />} />
        <Route path="/register/driver-license" element={<DrivingLicenceRegistration />} />
        <Route path="/emergency-card/:patientId" element={<EmergencyCard />} />
        <Route path="/emergency/:qrCode" element={<EmergencyCard />} />
        <Route path="/edit-profile/:patientId" element={<EditProfile />} />
        <Route path="/qr-code/:patientId" element={<QRCodeDisplay />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/superadmin-dashboard" element={<SuperAdminDashboard />} />
      </Routes>

      {/* Footer - Hide for admin routes */}
      {!hideHeaderFooter && (
        <footer style={{ backgroundColor: 'var(--color-primary-dark)', color: 'white', padding: '60px 0 20px 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '40px' }}>
              {/* Brand Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <img src="/logo.png" alt="JeevanRaksha" style={{ height: '40px' }} onError={(e) => e.target.style.display = 'none'} />
                  <h4 style={{ fontSize: '1.5rem', margin: 0 }}>JeevanRaksha</h4>
                </div>
                <p style={{ opacity: 0.7, maxWidth: '350px', lineHeight: '1.8' }}>
                  Empowering healthcare with secure, instant access to medical records. Saving lives through technology.
                </p>
                {/* Social Media Icons */}
                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{
                    width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none',
                    transition: 'background-color 0.3s'
                  }}>f</a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{
                    width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none',
                    transition: 'background-color 0.3s'
                  }}>𝕏</a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{
                    width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none',
                    transition: 'background-color 0.3s'
                  }}>in</a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{
                    width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none',
                    transition: 'background-color 0.3s'
                  }} aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.4" fill="none" />
                      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
                      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h5 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: '600' }}>Quick Links</h5>
                <ul style={{ listStyle: 'none', padding: 0, opacity: 0.8, lineHeight: '2.2' }}>
                  <li><a href="/" style={{ color: 'white', textDecoration: 'none', opacity: 0.8, transition: 'opacity 0.3s' }}>Home</a></li>
                  <li><a href="/features" style={{ color: 'white', textDecoration: 'none', opacity: 0.8, transition: 'opacity 0.3s' }}>Features</a></li>
                  <li><a href="/contact" style={{ color: 'white', textDecoration: 'none', opacity: 0.8, transition: 'opacity 0.3s' }}>Contact</a></li>
                  <li><a href="/login" style={{ color: 'white', textDecoration: 'none', opacity: 0.8, transition: 'opacity 0.3s' }}>Login</a></li>
                </ul>
              </div>

              {/* For Users */}
              <div>
                <h5 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: '600' }}>For Users</h5>
                <ul style={{ listStyle: 'none', padding: 0, opacity: 0.8, lineHeight: '2.2' }}>
                  <li><a href="/register" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>For Patients</a></li>
                  <li><a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>For Doctors</a></li>
                  <li><a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>For Hospitals</a></li>
                  <li><a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Privacy Policy</a></li>
                </ul>
              </div>

              {/* Contact Us */}
              <div>
                <h5 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: '600' }}>Contact Us</h5>
                <ul style={{ listStyle: 'none', padding: 0, opacity: 0.8, lineHeight: '2.2' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span>📍</span>
                    <span>123 Medical District,<br />Bangalore, Karnataka 560001</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <span>📞</span>
                    <span>+91 80 1234 5678</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <span>✉️</span>
                    <span>info@jeevanraksha.com</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>
                &copy; 2026 JeevanRaksha. All rights reserved.
              </p>
              <div style={{ display: 'flex', gap: '25px', opacity: 0.6, fontSize: '0.9rem' }}>
                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Terms of Service</a>
                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
