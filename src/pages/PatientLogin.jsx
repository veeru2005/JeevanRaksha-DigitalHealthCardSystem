import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PatientLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // First, try to login as admin/superadmin
            const adminResponse = await fetch(`${API_BASE_URL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const adminData = await adminResponse.json();

            if (adminResponse.ok && adminData.success) {
                // Admin login successful
                localStorage.setItem('adminToken', adminData.token);
                localStorage.setItem('adminRole', adminData.admin?.role || 'admin');
                localStorage.setItem('adminId', adminData.admin?.id || '');
                localStorage.setItem('adminUsername', adminData.admin?.username || '');
                localStorage.setItem('adminPermissions', JSON.stringify(adminData.admin?.permissions || {}));

                // Redirect based on role
                if (adminData.admin?.role === 'superadmin') {
                    navigate('/admin/superadmin-dashboard');
                } else {
                    navigate('/admin/dashboard');
                }
                return;
            }

            // If admin login fails, try to sync superadmin (in case patient exists but admin entry doesn't)
            const syncResponse = await fetch(`${API_BASE_URL}/api/admin/sync-superadmin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const syncData = await syncResponse.json();

            if (syncResponse.ok && syncData.success) {
                // Superadmin synced and logged in
                localStorage.setItem('adminToken', syncData.token);
                localStorage.setItem('adminRole', syncData.admin?.role || 'superadmin');
                localStorage.setItem('adminId', syncData.admin?.id || '');
                localStorage.setItem('adminUsername', syncData.admin?.username || '');
                localStorage.setItem('adminPermissions', JSON.stringify(syncData.admin?.permissions || {}));
                navigate('/admin/superadmin-dashboard');
                return;
            }

            // If admin/sync fails, try patient login
            const response = await fetch(`${API_BASE_URL}/api/patients/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Backend returns patient info under data.data
                const token = data.data?.token || data.token;
                const patient = data.data?.patient || data.patient;

                if (!patient) {
                    setError('Login failed: invalid server response');
                    return;
                }

                // Store patient info
                if (token) localStorage.setItem('patientToken', token);
                localStorage.setItem('patientId', patient.id);
                localStorage.setItem('patientName', patient.fullName || '');
                localStorage.setItem('patientEmail', patient.email || '');

                // Generate and store Health Card ID for Home page display
                let formattedHealthId = 'N/A';
                if (patient.healthId) {
                    const hId = patient.healthId.toString();
                    formattedHealthId = `${hId.slice(0, 4)} ${hId.slice(4, 8)} ${hId.slice(8, 12)} ${hId.slice(12, 16)}`;
                } else if (patient.id) {
                    const hash = patient.id.toString().replace(/[^0-9]/g, '').padEnd(16, '0').slice(0, 16);
                    formattedHealthId = `${hash.slice(0, 4)} ${hash.slice(4, 8)} ${hash.slice(8, 12)} ${hash.slice(12, 16)}`;
                }
                localStorage.setItem(`cardNumber_${patient.id}`, formattedHealthId);

                // Redirect to profile/dashboard
                navigate(`/emergency-card/${patient.id}`);
            } else {
                setError(data.error || data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8f9fa'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                padding: '50px',
                maxWidth: '450px',
                width: '100%'
            }}>
                {/* Logo and Title */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img
                        src="/Logo.png"
                        alt="JeevanRaksha Logo"
                        style={{ height: '60px', marginBottom: '0px' }}
                    />
                    <h1 style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: 'var(--color-primary-dark)',
                        marginBottom: '8px',
                        fontFamily: 'Quicksand, sans-serif'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: '#666', fontSize: '1rem', fontFamily: 'Quicksand, sans-serif' }}>
                        Login to access your JeevanRaksha Health ID
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: '#c33',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        border: '1px solid #fcc'
                    }}>
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                            style={{
                                width: '100%',
                                padding: '14px',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontFamily: 'Quicksand, sans-serif',
                                transition: 'border-color 0.3s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            style={{
                                width: '100%',
                                padding: '14px',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontFamily: 'Quicksand, sans-serif',
                                transition: 'border-color 0.3s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: loading ? '#ccc' : 'var(--color-primary-dark)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.3s',
                            boxSizing: 'border-box'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* Register Link */}
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <p style={{ color: '#666' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{
                            color: 'var(--color-primary)',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}>
                            Register Now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PatientLogin;
