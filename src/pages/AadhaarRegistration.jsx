import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const AadhaarRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [aadhaar, setAadhaar] = useState(['', '', '']);
    const [isConsentGiven, setIsConsentGiven] = useState(false);
    const [otp, setOtp] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
    const [captchaInput, setCaptchaInput] = useState('');
    const [toast, setToast] = useState({ show: false, patientId: '', qrCode: '' });

    // Generate random CAPTCHA on component mount
    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({ num1, num2, answer: num1 + num2 });
        setCaptchaInput('');
    };

    // Simple mock identity generator for demo/testing
    const generateMockIdentity = () => {
        const names = ['Veeru K.', 'Arjun S.', 'Priya R.', 'Sneha M.', 'Rahul P.', 'Asha T.'];
        const name = names[Math.floor(Math.random() * names.length)];
        // Generate random mobile starting with 9 and 9 more digits
        const mobile = '9' + Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
        return { name, mobile };
    };

    const handleAadhaarChange = (index, value) => {
        if (value.length > 4) return;
        const newAadhaar = [...aadhaar];
        newAadhaar[index] = value;
        setAadhaar(newAadhaar);

        // Auto-focus next input
        if (value.length === 4 && index < 2) {
            document.getElementById(`aadhaar-${index + 1}`).focus();
        }
    };

    const handleNext = async () => {
        setError('');

        if (step === 1) {
            const aadhaarNumber = aadhaar.join('');
            if (aadhaarNumber.length !== 12) {
                setError("Please enter a valid 12-digit Aadhaar number");
                return;
            }
            if (!isConsentGiven) {
                setError("Please provide your consent to proceed");
                return;
            }
            // Validate CAPTCHA
            if (parseInt(captchaInput) !== captcha.answer) {
                setError("Invalid CAPTCHA. Please try again.");
                generateCaptcha();
                return;
            }
            // Send OTP logic here (mock)
            setStep(2);
        } else if (step === 2) {
            if (otp.length !== 6) {
                setError("Please enter a valid 6-digit OTP");
                return;
            }
            // Verify OTP logic here (mock) - also get mobile number from Aadhaar
            const id = generateMockIdentity();
            setFullName(id.name);
            setMobileNumber(id.mobile);
            setStep(3);
        } else if (step === 3) {
            // Final submission - now requires email and password
            if (!email || !email.includes('@')) {
                setError("Please enter a valid email address");
                return;
            }
            if (!password || password.length < 6) {
                setError("Password must be at least 6 characters");
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/register/aadhaar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        aadhaarNumber: aadhaar.join(''),
                        otp,
                        fullName,
                        mobileNumber,
                        email,
                        password,
                        consentGiven: isConsentGiven
                    })
                });

                const data = await response.json();

                if (data.success) {
                    const patientId = data.data.patientId;

                    // Auto-login: Store patient info
                    localStorage.setItem('patientToken', data.data.token);
                    localStorage.setItem('patientId', patientId);
                    localStorage.setItem('patientName', data.data.fullName);
                    localStorage.setItem('patientEmail', data.data.email);

                    // If superadmin, also try to get admin token
                    if (data.data.isSuperadmin) {
                        try {
                            const adminLoginRes = await fetch(`${API_BASE_URL}/admin/login`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password })
                            });
                            const adminLoginData = await adminLoginRes.json();
                            if (adminLoginData.success) {
                                localStorage.setItem('adminToken', adminLoginData.token);
                                localStorage.setItem('adminRole', adminLoginData.admin.role);
                                localStorage.setItem('adminId', adminLoginData.admin.id);
                                localStorage.setItem('adminUsername', adminLoginData.admin.username);
                                localStorage.setItem('adminPermissions', JSON.stringify(adminLoginData.admin.permissions));
                            }
                        } catch (e) {
                            console.log('Admin login after registration failed:', e);
                        }
                    }

                    setToast({
                        show: true,
                        patientId: patientId,
                        qrCode: data.data.qrCode
                    });
                } else {
                    setError(data.message || 'Registration failed. Please try again.');
                }
            } catch (err) {
                console.error('Registration error:', err);
                setError('Network error. Please check if the server is running.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', minHeight: '80vh', maxWidth: '800px', margin: '0 auto' }}>
            {/* Toast Notification */}
            {toast.show && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    padding: '24px',
                    zIndex: 1000,
                    maxWidth: '400px',
                    width: '90%',
                    animation: 'slideIn 0.3s ease-out',
                    fontFamily: 'Quicksand, sans-serif'
                }}>
                    <style>
                        {`
                            @keyframes slideIn {
                                from { transform: translateX(100%); opacity: 0; }
                                to { transform: translateX(0); opacity: 1; }
                            }
                        `}
                    </style>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#e8f5e9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>✅</div>
                        <h3 style={{ margin: 0, color: '#1a5d4a', fontSize: '1.2rem' }}>Registration Successful!</h3>
                    </div>
                    <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>Patient ID:</p>
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '600', color: '#333', wordBreak: 'break-all' }}>{toast.patientId}</p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>QR Code:</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#333', wordBreak: 'break-all' }}>{toast.qrCode}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                fontFamily: 'Quicksand, sans-serif',
                                fontWeight: '600',
                                color: '#666'
                            }}
                        >
                            Go to Home
                        </button>
                        <button
                            onClick={() => navigate(`/qr-code/${toast.patientId}`)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                borderRadius: '8px',
                                backgroundColor: '#1a5d4a',
                                color: 'white',
                                cursor: 'pointer',
                                fontFamily: 'Quicksand, sans-serif',
                                fontWeight: '600'
                            }}
                        >
                            View QR Code
                        </button>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    backgroundColor: '#fee',
                    color: '#c00',
                    borderRadius: '8px',
                    border: '1px solid #fcc',
                    fontFamily: 'Quicksand, sans-serif'
                }}>
                    {error}
                </div>
            )}

            {/* Stepper Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative', fontFamily: 'Quicksand, sans-serif' }}>
                <div style={{ position: 'absolute', top: '15px', left: '0', height: '2px', backgroundColor: '#e0e0e0', width: '100%', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', top: '15px', left: '0', height: '2px', backgroundColor: 'var(--color-primary)', width: `${(step - 1) * 50}%`, zIndex: 0, transition: 'width 0.3s' }}></div>

                {[1, 2, 3].map((s) => (
                    <div key={s} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: step >= s ? 'var(--color-primary)' : '#e0e0e0',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 8px auto',
                            fontWeight: '600'
                        }}>
                            {s}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: step >= s ? 'var(--color-primary)' : '#999' }}>
                            {s === 1 ? 'Consent & Aadhaar' : s === 2 ? 'Authentication' : 'Profile'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="card">
                {step === 1 && (
                    <div>
                        <h3 style={{ marginBottom: '0px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Consent Collection</h3>

                        <div style={{ marginBottom: '0px' }}>
                            <label style={{ display: 'block', marginBottom: '0px', fontWeight: '50', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>Aadhaar Number <span style={{ color: 'red' }}>*</span></label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {aadhaar.map((part, index) => (
                                    <input
                                        key={index}
                                        id={`aadhaar-${index}`}
                                        type="number"
                                        placeholder="0000"
                                        value={part}
                                        onChange={(e) => handleAadhaarChange(index, e.target.value)}
                                        style={{
                                            flex: '1 1 100px',
                                            minWidth: '80px',
                                            maxWidth: '120px',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            border: '1px solid #ddd',
                                            textAlign: 'center',
                                            fontSize: '1.1rem',
                                            fontFamily: 'Quicksand, sans-serif'
                                        }}
                                    />
                                ))}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>
                                Your Aadhaar number is required to verify identity for creating JeevanRaksha ID.
                            </p>
                        </div>

                        <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontFamily: 'Quicksand, sans-serif' }}>
                            <h4 style={{ margin: '0 0 10px 0', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>Terms and Conditions</h4>
                            <p style={{ margin: 0, color: '#555', lineHeight: '1.5', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>
                                I hereby declare that I am voluntarily sharing my Aadhaar number and demographic information issued by UIDAI,
                                with JeevanRaksha System for the sole purpose of creation of my Digital Health ID.
                                I understand that my information will be encrypted and stored securely.
                            </p>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: 'Quicksand, sans-serif' }}>
                            <input
                                type="checkbox"
                                checked={isConsentGiven}
                                onChange={(e) => setIsConsentGiven(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontSize: '0.95rem', fontFamily: 'Quicksand, sans-serif' }}>I agree to the Terms and Conditions</span>
                        </label>

                        {/* CAPTCHA Verification */}
                        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', width: '100%', maxWidth: '400px', fontFamily: 'Quicksand, sans-serif' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '2px', fontFamily: 'Quicksand, sans-serif' }}>
                                    {captcha.num1} + {captcha.num2} = ?
                                </span>
                                <input
                                    type="number"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    style={{ padding: '8px', width: '70px', fontFamily: 'Quicksand, sans-serif', borderRadius: '4px', border: '1px solid #ddd' }}
                                    placeholder="Ans"
                                />
                                <button
                                    type="button"
                                    onClick={generateCaptcha}
                                    style={{ padding: '8px 12px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Quicksand, sans-serif', fontSize: '0.9rem' }}
                                    title="Refresh CAPTCHA"
                                >
                                    ↻
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Aadhaar Authentication</h3>
                        <p style={{ marginBottom: '20px' }}>
                            An OTP has been sent to the mobile number linked with your Aadhaar (******1234).
                        </p>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Enter OTP</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    if (value.length <= 6) {
                                        setOtp(value);
                                    }
                                }}
                                placeholder="Enter 6-digit OTP"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '1.1rem',
                                    letterSpacing: '8px',
                                    textAlign: 'center',
                                    fontFamily: 'Quicksand, sans-serif'
                                }}
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>Create Your Account</h3>
                        <p style={{ color: 'green', marginBottom: '20px', fontWeight: '600', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>
                            ✓ Aadhaar Verified Successfully: {fullName}
                        </p>
                        <p style={{
                            fontSize: '0.9rem',
                            color: '#666',
                            marginBottom: '20px',
                            backgroundColor: '#e8f5e9',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #a5d6a7'
                        }}>
                            📱 Mobile Number (from Aadhaar): <strong>+91 {mobileNumber}</strong>
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', textAlign: 'left', fontWeight: '500', fontFamily: 'Quicksand, sans-serif' }}>
                                Email Address <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="email"
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'Quicksand, sans-serif' }}
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                This will be used for login and important notifications
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', textAlign: 'left', fontWeight: '500', fontFamily: 'Quicksand, sans-serif' }}>
                                Create Password <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="password"
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'Quicksand, sans-serif' }}
                                placeholder="Create a strong password (min 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', textAlign: 'left', fontWeight: '500', fontFamily: 'Quicksand, sans-serif' }}>
                                Confirm Password <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="password"
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'Quicksand, sans-serif' }}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', borderTop: '1px solid #f0f0f0', paddingTop: '20px', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-outline"
                        onClick={() => step > 1 ? setStep(step - 1) : navigate('/register')}
                        style={{ flex: '1 1 120px', minWidth: '120px', fontFamily: 'Quicksand, sans-serif' }}
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleNext}
                        disabled={loading}
                        style={{ flex: '1 1 120px', minWidth: '120px', fontFamily: 'Quicksand, sans-serif' }}
                    >
                        {loading ? 'Processing...' : (step === 3 ? 'Create ID' : 'Next')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AadhaarRegistration;
