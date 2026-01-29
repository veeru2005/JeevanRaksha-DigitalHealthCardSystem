import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegistrationSelection = () => {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ padding: '60px 20px', minHeight: '80vh' }}>
            <div className="text-center" style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '10px' }}>
                    Create JeevanRaksha ID
                </h2>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    Please choose one of the below options to start with the creation of your account
                </p>
            </div>

            <div className="grid" style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '40px',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                {/* Aadhaar Option */}
                <div
                    className="card"
                    style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        padding: '40px',
                        border: '2px solid transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '250px'
                    }}
                    onClick={() => navigate('/register/aadhaar')}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                    <div style={{ marginBottom: '20px' }}>
                        {/* Simple Aadhaar Icon Placeholder */}
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h3 style={{ color: 'var(--color-primary)', marginBottom: '10px' }}>Using Aadhaar</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Instant verification using OTP sent to your Aadhaar linked mobile number
                    </p>
                </div>

                {/* Driving Licence Option */}
                <div
                    className="card"
                    style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        padding: '40px',
                        border: '2px solid transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '250px'
                    }}
                    onClick={() => navigate('/register/driver-license')}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                    <div style={{ marginBottom: '20px' }}>
                        {/* Simple ID Card Icon Placeholder */}
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="4" width="18" height="16" rx="2" stroke="var(--color-secondary)" strokeWidth="2" />
                            <circle cx="9" cy="10" r="2" stroke="var(--color-secondary)" strokeWidth="2" />
                            <line x1="15" y1="8" x2="17" y2="8" stroke="var(--color-secondary)" strokeWidth="2" />
                            <line x1="15" y1="12" x2="17" y2="12" stroke="var(--color-secondary)" strokeWidth="2" />
                            <line x1="7" y1="16" x2="17" y2="16" stroke="var(--color-secondary)" strokeWidth="2" />
                        </svg>
                    </div>
                    <h3 style={{ color: 'var(--color-primary)', marginBottom: '10px' }}>Using Driving Licence</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Verify using your Driving Licence number and Date of Birth
                    </p>
                </div>
            </div>

            {/* Removed redundant prompt asking users to login here; navbar provides separate Login button */}
        </div>
    );
};

export default RegistrationSelection;
