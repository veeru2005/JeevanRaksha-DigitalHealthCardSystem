import React, { useState, useRef, useEffect } from 'react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [dots, setDots] = useState('');
    const dotsRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        // start typing/dots animation
        dotsRef.current = setInterval(() => setDots(prev => (prev.length >= 3 ? '' : prev + '.')), 300);
        try {
            const res = await fetch('http://localhost:5001/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message
                })
            });

            const data = await res.json();
            if (data && data.success) {
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                }, 3000);
            } else {
                alert('Failed to send message: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Contact submit error', err);
            alert('Network error: could not send message');
        } finally {
            if (dotsRef.current) {
                clearInterval(dotsRef.current);
                dotsRef.current = null;
            }
            setDots('');
            setSending(false);
        }
    };

    useEffect(() => {
        return () => {
            if (dotsRef.current) {
                clearInterval(dotsRef.current);
            }
        };
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#FFFDF7',
            fontFamily: 'Quicksand, sans-serif'
        }}>
            {/* Hero Section */}
            <section style={{
                backgroundColor: '#FFFDF7',
                padding: '10px 20px',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: '700', color: '#1a5d4a' }}>
                        Get In Touch
                    </h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', color: '#333' }}>
                        Have questions? We are here to help. Reach out to our team anytime.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section style={{ padding: '40px 20px', backgroundColor: '#FFFDF7' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Top Row - 3 Equal Boxes */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '25px',
                        marginBottom: '30px'
                    }}>
                        {/* Address */}
                        <div style={{
                            padding: '30px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                width: '55px',
                                height: '55px',
                                backgroundColor: '#e8f5e9',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '18px',
                                fontSize: '1.6rem'
                            }}>
                                📍
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-primary-dark)' }}>
                                Office Address
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.7', margin: 0 }}>
                                JeevanRaksha Healthcare Solutions<br />
                                123 Medical District<br />
                                Bangalore, Karnataka 560001<br />
                                India
                            </p>
                        </div>

                        {/* Phone */}
                        <div style={{
                            padding: '30px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                width: '55px',
                                height: '55px',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '18px',
                                fontSize: '1.6rem'
                            }}>
                                📞
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-primary-dark)' }}>
                                Phone Numbers
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.7', margin: 0 }}>
                                Customer Support: +91 80 1234 5678<br />
                                Emergency: 1800 123 4567 (Toll Free)<br />
                                Mon - Sat: 9:00 AM - 6:00 PM
                            </p>
                        </div>

                        {/* Email */}
                        <div style={{
                            padding: '30px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                width: '55px',
                                height: '55px',
                                backgroundColor: '#fff3e0',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '18px',
                                fontSize: '1.6rem'
                            }}>
                                ✉️
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-primary-dark)' }}>
                                Email Addresses
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.7', margin: 0 }}>
                                General: info@jeevanraksha.com<br />
                                Support: support@jeevanraksha.com<br />
                                Partnerships: partnerships@jeevanraksha.com
                            </p>
                        </div>
                    </div>

                    {/* Social Media (Left) + Contact Form (Right) */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '30px',
                        alignItems: 'stretch'
                    }}>
                        {/* Left Side - Social Media Boxes (Stacked Vertically) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '100%' }}>
                            {/* Facebook */}
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: 1, display: 'flex' }}>
                                <div style={{
                                    padding: '25px 30px',
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '25px',
                                    flex: 1,
                                    width: '100%'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: '#1877f2',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.8rem',
                                        fontWeight: '700',
                                        flexShrink: 0
                                    }}>
                                        f
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.2rem' }}>Facebook</h4>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Follow us on Facebook</p>
                                    </div>
                                </div>
                            </a>

                            {/* X (Twitter) */}
                            <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: 1, display: 'flex' }}>
                                <div style={{
                                    padding: '25px 30px',
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '25px',
                                    flex: 1,
                                    width: '100%'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: '#000',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.6rem',
                                        fontWeight: '700',
                                        flexShrink: 0
                                    }}>
                                        𝕏
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.2rem' }}>X (Twitter)</h4>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Tweet with us</p>
                                    </div>
                                </div>
                            </a>

                            {/* LinkedIn */}
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: 1, display: 'flex' }}>
                                <div style={{
                                    padding: '25px 30px',
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '25px',
                                    flex: 1,
                                    width: '100%'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: '#0077b5',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.6rem',
                                        fontWeight: '700',
                                        flexShrink: 0
                                    }}>
                                        in
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.2rem' }}>LinkedIn</h4>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Connect with us</p>
                                    </div>
                                </div>
                            </a>

                            {/* Instagram */}
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: 1, display: 'flex' }}>
                                <div style={{
                                    padding: '25px 30px',
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '25px',
                                    flex: 1,
                                    width: '100%'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.6rem',
                                        flexShrink: 0
                                    }}>
                                        📷
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.2rem' }}>Instagram</h4>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Follow our updates</p>
                                    </div>
                                </div>
                            </a>
                        </div>

                        {/* Right Side - Contact Form */}
                        <div style={{
                            padding: '35px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '25px', color: 'var(--color-primary-dark)' }}>
                                Send Us a Message
                            </h2>

                            {submitted && (
                                <div style={{
                                    padding: '15px',
                                    marginBottom: '20px',
                                    backgroundColor: '#e8f5e9',
                                    color: '#2e7d32',
                                    borderRadius: '8px',
                                    border: '1px solid #a5d6a7'
                                }}>
                                    ✓ Thank you! Your message has been sent successfully.
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                    <div style={{ flex: '1 1 320px' }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '6px',
                                                border: '1px solid #ddd',
                                                fontSize: '1rem',
                                                fontFamily: 'Quicksand, sans-serif',
                                                boxSizing: 'border-box'
                                            }}
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div style={{ flex: '1 1 320px', minWidth: '220px' }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                borderRadius: '6px',
                                                border: '1px solid #ddd',
                                                fontSize: '1rem',
                                                fontFamily: 'Quicksand, sans-serif',
                                                boxSizing: 'border-box',
                                                height: '48px',
                                                lineHeight: '1.2'
                                            }}
                                            placeholder="Subject"
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            border: '1px solid #ddd',
                                            fontSize: '1rem',
                                            fontFamily: 'Quicksand, sans-serif',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div style={{ marginBottom: '20px', flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                                        Message *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows="5"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            border: '1px solid #ddd',
                                            fontSize: '1rem',
                                            fontFamily: 'Quicksand, sans-serif',
                                            boxSizing: 'border-box',
                                            resize: 'vertical',
                                            minHeight: '120px'
                                        }}
                                        placeholder="Type your message here..."
                                    />
                                </div>
                                <style>{`.spin{animation:spin 1s linear infinite;}@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    aria-busy={sending}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        cursor: sending ? 'not-allowed' : 'pointer',
                                        fontFamily: 'Quicksand, sans-serif',
                                        opacity: sending ? 0.9 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {sending ? (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                                            <span>Sending{dots}</span>
                                            <svg className="spin" width="18" height="18" viewBox="0 0 50 50" style={{ display: 'block' }}>
                                                <path fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" d="M25 5 a20 20 0 0 1 0 40" />
                                            </svg>
                                        </div>
                                    ) : (
                                        'Send Message'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
