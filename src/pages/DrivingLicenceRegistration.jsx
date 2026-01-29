import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const DrivingLicenceRegistration = () => {
    const navigate = useNavigate();
    const [dlNumber, setDlNumber] = useState('');
    const [dob, setDob] = useState('');
    const [fullName, setFullName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    const handleVerify = (e) => {
        e.preventDefault();
        setError('');

        if (!dlNumber || !dob) {
            setError('Please fill in all fields');
            return;
        }

        // Simulate DL verification
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            // generate a mock identity for demo
            const names = ['Veeru K.', 'Arjun S.', 'Priya R.', 'Sneha M.', 'Rahul P.', 'Asha T.'];
            const name = names[Math.floor(Math.random() * names.length)];
            const mobile = '9' + Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
            setFullName(name);
            setMobileNumber(mobile);
            setStep(2);
        }, 1500);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!fullName || !email || !password || !confirmPassword) {
            setError('Please fill in all required fields');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch(`${API_BASE_URL}/register/driving-license`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    drivingLicenseNumber: dlNumber,
                    dateOfBirth: dob,
                    fullName,
                    mobileNumber,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                const patientId = data.data.patientId;
                const confirmed = window.confirm(
                    `✅ Registration Successful!\n\n` +
                    `Patient ID: ${data.data.patientId}\n` +
                    `QR Code: ${data.data.qrCode}\n\n` +
                    `Click OK to view your Digital Medical ID and QR Code.\n` +
                    `Click Cancel to go to homepage.`
                );

                if (confirmed) {
                    navigate(`/qr-code/${patientId}`);
                } else {
                    navigate('/');
                }
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Network error. Please check if the server is running.');
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="container" style={{ width: '100%', maxWidth: '600px' }}>
                <div className="card">
                    {error && (
                        <div style={{
                            padding: '15px',
                            marginBottom: '20px',
                            backgroundColor: '#fee',
                            color: '#c00',
                            borderRadius: '8px',
                            border: '1px solid #fcc',
                            fontFamily: 'Quicksand, sans-serif',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginBottom: '30px', fontFamily: 'Quicksand, sans-serif' }}>
                        <h2 style={{ color: 'var(--color-primary-dark)', fontFamily: 'Quicksand, sans-serif', margin: '0 0 10px 0' }}>
                            {step === 1 ? 'Driving Licence Verification' : 'Complete Registration'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontFamily: 'Quicksand, sans-serif', margin: '0' }}>
                            {step === 1 ? 'Enter details exactly as they appear on your licence' : 'Provide contact information'}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleVerify}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>
                                    Driving Licence Number <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="DL-1420110012345"
                                    value={dlNumber}
                                    onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'Quicksand, sans-serif', boxSizing: 'border-box' }}
                                    required
                                />
                                <span style={{ fontSize: '0.8rem', color: '#888', fontFamily: 'Quicksand, sans-serif', display: 'block', marginTop: '5px' }}>Format: DL-1420110012345 or similar</span>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>
                                    Date of Birth <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'Quicksand, sans-serif', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: '1 1 120px', minWidth: '120px', fontFamily: 'Quicksand, sans-serif' }}
                                    onClick={() => navigate('/register')}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: '1 1 120px', minWidth: '120px', fontFamily: 'Quicksand, sans-serif' }}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Verifying...' : 'Verify & Continue'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <p style={{ color: 'green', marginBottom: '20px', fontWeight: '600', fontFamily: 'Quicksand, sans-serif', textAlign: 'center' }}>
                                ✓ Driving Licence Verified: {fullName}
                            </p>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>
                                    Full Name <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'Quicksand, sans-serif', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', textAlign: 'left', fontFamily: 'Quicksand, sans-serif', color: '#1e40af' }}>
                                    📱 Mobile Number (from Driving Licence)
                                </label>
                                <p style={{ margin: 0, fontFamily: 'Quicksand, sans-serif', fontSize: '1.1rem', fontWeight: '600', color: '#1e40af' }}>
                                    +91 {mobileNumber}
                                </p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>
                                    Email Address <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'Quicksand, sans-serif', boxSizing: 'border-box' }}
                                    required
                                />
                                <span style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'Quicksand, sans-serif', display: 'block', marginTop: '5px' }}>
                                    This will be used for login
                                </span>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>
                                    Create Password <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'Quicksand, sans-serif', boxSizing: 'border-box' }}
                                    minLength="6"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', textAlign: 'left', fontFamily: 'Quicksand, sans-serif' }}>
                                    Confirm Password <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'Quicksand, sans-serif', boxSizing: 'border-box' }}
                                    minLength="6"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: '1 1 120px', minWidth: '120px', fontFamily: 'Quicksand, sans-serif' }}
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: '1 1 120px', minWidth: '120px', fontFamily: 'Quicksand, sans-serif' }}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Registering...' : 'Complete Registration'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DrivingLicenceRegistration;
