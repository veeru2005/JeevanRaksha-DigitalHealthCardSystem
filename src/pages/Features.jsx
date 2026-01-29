import React from 'react';
import { useNavigate } from 'react-router-dom';

const Features = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#FFFDF7',
            fontFamily: 'Quicksand, sans-serif'
        }}>
            {/* Hero Section */}
            <section style={{
                backgroundColor: '#FFFDF7',
                padding: ' 10px 20px',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: '700', color: '#1a5d4a' }}>
                        Comprehensive Health Features
                    </h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', color: '#333' }}>
                        JeevanRaksha provides a complete ecosystem for managing your healthcare digitally
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '30px 20px', backgroundColor: '#FFFDF7' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '30px'
                    }}>
                        {/* Feature 1 */}
                        <div className="card" style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            transition: 'transform 0.3s'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#e8f5e9',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                fontSize: '2rem'
                            }}>
                                🏥
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>
                                Digital Health Card
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                Carry your complete medical history in your pocket. Access your health card anytime, anywhere with our secure digital platform.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card" style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#ffebee',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                fontSize: '2rem'
                            }}>
                                🚨
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>
                                Emergency Access
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                Critical medical information available instantly to first responders through QR code scanning. No login required in emergencies.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card" style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                fontSize: '2rem'
                            }}>
                                📱
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>
                                QR Code System
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                Unique QR code for each patient. Scan to access emergency medical information instantly. Download and print for your wallet.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card" style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#fff3e0',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                fontSize: '2rem'
                            }}>
                                💊
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>
                                Medication Tracking
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                Keep track of all your medications, dosages, and frequencies. Never forget your prescription details again.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="card" style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#fce4ec',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                fontSize: '2rem'
                            }}>
                                ⚠️
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>
                                Allergy Alerts
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                Life-saving allergy information prominently displayed. Prevent dangerous drug interactions and allergic reactions.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="card" style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#f3e5f5',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                fontSize: '2rem'
                            }}>
                                📞
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>
                                Emergency Contacts
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                One-tap calling to emergency contacts. Your loved ones can be reached instantly when it matters most.
                            </p>
                        </div>

                        {/* Feature 7 */}
                        <div className="card" style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#e0f7fa',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                fontSize: '2rem'
                            }}>
                                🔒
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>
                                Lock Screen Mode
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                High-contrast emergency display mode. Extra-large text and maximum visibility for first responders in critical situations.
                            </p>
                        </div>

                        {/* Feature 8 */}
                        <div className="card" style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#e8eaf6',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                fontSize: '2rem'
                            }}>
                                🩺
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>
                                Medical History
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                Complete record of medical conditions, surgeries, and treatments. Share with healthcare providers securely.
                            </p>
                        </div>

                        {/* Feature 9 */}
                        <div className="card" style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#fff9c4',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                fontSize: '2rem'
                            }}>
                                🔐
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-primary-dark)' }}>
                                Bank-Grade Security
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                Your data is encrypted end-to-end. HIPAA compliant storage with multi-layer security protocols.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                backgroundColor: '#FFFDF7',
                padding: '60px 20px',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: '700', color: '#1a5d4a' }}>
                        Ready to Get Started?
                    </h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px auto', color: '#333' }}>
                        Create your JeevanRaksha Digital Health ID today and take control of your medical information.
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            padding: '15px 40px',
                            fontSize: '1.1rem',
                            backgroundColor: '#1a5d4a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'Quicksand, sans-serif',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                        }}
                    >
                        Register Now - It's Free
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Features;
