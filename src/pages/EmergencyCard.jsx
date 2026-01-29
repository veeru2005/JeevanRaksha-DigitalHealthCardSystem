import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const EmergencyCard = () => {
    const { patientId, qrCode } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lockScreenMode, setLockScreenMode] = useState(false);

    useEffect(() => {
        fetchPatientData();
    }, [patientId, qrCode]);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            let url;

            if (qrCode) {
                url = `${API_BASE_URL}/emergency/${qrCode}`;
            } else if (patientId) {
                url = `${API_BASE_URL}/patients/${patientId}`;
            } else {
                setError('No patient identifier provided');
                setLoading(false);
                return;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setPatient(data.data);
            } else {
                setError(data.message || 'Failed to load patient data');
            }
        } catch (err) {
            console.error('Error fetching patient:', err);
            setError('Network error. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontFamily: 'Quicksand, sans-serif'
            }}>
                <div>Loading emergency information...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontFamily: 'Quicksand, sans-serif',
                padding: '20px'
            }}>
                <div style={{
                    textAlign: 'center',
                    backgroundColor: '#fee',
                    padding: '30px',
                    borderRadius: '12px',
                    border: '2px solid #fcc'
                }}>
                    <h2 style={{ color: '#c00', marginBottom: '15px' }}>Error</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontFamily: 'Quicksand, sans-serif'
                        }}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const containerStyle = lockScreenMode ? {
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        padding: '20px',
        fontFamily: 'Quicksand, sans-serif'
    } : {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        fontFamily: 'Quicksand, sans-serif'
    };

    const cardStyle = lockScreenMode ? {
        maxWidth: '100%',
        margin: '0 auto',
        backgroundColor: '#000',
        border: '3px solid #ff0000'
    } : {
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '30px'
    };

    const titleSize = lockScreenMode ? '3.5rem' : '2.5rem';
    const textSize = lockScreenMode ? '2rem' : '1.3rem';
    const allergySize = lockScreenMode ? '2.5rem' : '1.8rem';

    // Generate card number from patient ID
    const generateCardNumber = (id) => {
        if (patient?.healthId) {
            const hId = patient.healthId.toString();
            return `${hId.slice(0, 4)} ${hId.slice(4, 8)} ${hId.slice(8, 12)} ${hId.slice(12, 16)}`;
        }
        if (!id) return '0000 0000 0000 0000';
        const hash = id.toString().replace(/[^0-9]/g, '').padEnd(16, '0').slice(0, 16);
        return `${hash.slice(0, 4)} ${hash.slice(4, 8)} ${hash.slice(8, 12)} ${hash.slice(12, 16)}`;
    };

    // Get expiry date (5 years from now)
    const getExpiryDate = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 5);
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
    };

    return (
        <div style={containerStyle}>
            {/* Lock Screen Mode Toggle */}
            <div style={{ textAlign: 'right', marginBottom: '20px', maxWidth: '800px', margin: '0 auto 20px auto' }}>
                <button
                    onClick={() => setLockScreenMode(!lockScreenMode)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: lockScreenMode ? '#ff0000' : 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontFamily: 'Quicksand, sans-serif',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    {lockScreenMode ? '🔓 Normal Mode' : '🔒 Emergency Lock Screen Mode'}
                </button>
            </div>

            {/* Digital Health Card - Similar to Home Page */}
            {!lockScreenMode && (
                <div style={{ maxWidth: '450px', margin: '0 auto 30px auto' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                        borderRadius: '24px',
                        padding: '30px',
                        color: 'white',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        transform: 'rotate(-1deg)',
                        fontFamily: 'Quicksand, sans-serif'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', opacity: 0.9 }}>Digital Health Card</h3>
                                <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Universal ID</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ fontSize: '1.6rem', letterSpacing: '3px', fontWeight: '500' }}>
                                {generateCardNumber(patientId)}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {patient?.fullName || 'PATIENT NAME'}
                                </div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '5px' }}>
                                    Valid Thru: {getExpiryDate()}
                                </div>
                            </div>
                            <div style={{ width: '45px', height: '45px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '1.5rem' }}>📱</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={cardStyle}>
                {/* Emergency Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    paddingBottom: '20px',
                    borderBottom: lockScreenMode ? '2px solid #fff' : '2px solid #eee'
                }}>
                    <h1 style={{
                        fontSize: titleSize,
                        fontWeight: '700',
                        margin: '0 0 10px 0',
                        color: lockScreenMode ? '#fff' : 'var(--color-primary-dark)',
                        fontFamily: 'Quicksand, sans-serif'
                    }}>
                        {lockScreenMode ? '🚨 EMERGENCY MEDICAL ID 🚨' : '🏥 Digital Medical ID'}
                    </h1>
                    {!lockScreenMode && (
                        <p style={{
                            fontSize: '1rem',
                            color: '#666',
                            margin: 0
                        }}>
                            Critical health information at a glance
                        </p>
                    )}
                </div>

                {/* Patient Name */}
                <div style={{
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: lockScreenMode ? '#111' : '#f9f9f9',
                    borderRadius: '8px',
                    border: lockScreenMode ? '2px solid #fff' : 'none'
                }}>
                    <div style={{
                        fontSize: lockScreenMode ? '1.2rem' : '1rem',
                        color: lockScreenMode ? '#aaa' : '#666',
                        marginBottom: '5px',
                        fontWeight: '500'
                    }}>
                        PATIENT NAME
                    </div>
                    <div style={{
                        fontSize: textSize,
                        fontWeight: '700',
                        color: lockScreenMode ? '#fff' : '#000'
                    }}>
                        {patient?.fullName || 'N/A'}
                    </div>
                </div>

                {/* Blood Type */}
                <div style={{
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: lockScreenMode ? '#1a0000' : '#fff3f3',
                    borderRadius: '8px',
                    border: lockScreenMode ? '3px solid #ff0000' : '2px solid #ffcccc'
                }}>
                    <div style={{
                        fontSize: lockScreenMode ? '1.2rem' : '1rem',
                        color: lockScreenMode ? '#ff6666' : '#c00',
                        marginBottom: '5px',
                        fontWeight: '600'
                    }}>
                        BLOOD TYPE
                    </div>
                    <div style={{
                        fontSize: titleSize,
                        fontWeight: '700',
                        color: lockScreenMode ? '#ff0000' : '#c00'
                    }}>
                        {patient?.bloodType || 'NOT SPECIFIED'}
                    </div>
                </div>

                {/* Allergies */}
                {patient?.allergies && patient.allergies.length > 0 && (
                    <div style={{
                        marginBottom: '30px',
                        padding: '25px',
                        backgroundColor: lockScreenMode ? '#330000' : '#ffe6e6',
                        borderRadius: '8px',
                        border: lockScreenMode ? '4px solid #ff0000' : '3px solid #ff0000'
                    }}>
                        <div style={{
                            fontSize: allergySize,
                            fontWeight: '700',
                            color: '#ff0000',
                            marginBottom: '15px',
                            textTransform: 'uppercase'
                        }}>
                            ⚠️ ALLERGIES ⚠️
                        </div>
                        {patient.allergies.map((allergy, index) => (
                            <div key={index} style={{
                                fontSize: textSize,
                                fontWeight: '700',
                                color: '#ff0000',
                                marginBottom: '10px',
                                textTransform: 'uppercase'
                            }}>
                                • {allergy}
                            </div>
                        ))}
                    </div>
                )}

                {/* Medical Conditions */}
                {patient?.medicalConditions && patient.medicalConditions.length > 0 && (
                    <div style={{
                        marginBottom: '30px',
                        padding: '20px',
                        backgroundColor: lockScreenMode ? '#111' : '#fff8e6',
                        borderRadius: '8px',
                        border: lockScreenMode ? '2px solid #ffa500' : '2px solid #ffcc80'
                    }}>
                        <div style={{
                            fontSize: lockScreenMode ? '1.5rem' : '1.2rem',
                            color: lockScreenMode ? '#ffa500' : '#ff8800',
                            marginBottom: '15px',
                            fontWeight: '600'
                        }}>
                            MEDICAL CONDITIONS
                        </div>
                        {patient.medicalConditions.map((condition, index) => (
                            <div key={index} style={{
                                fontSize: lockScreenMode ? '1.3rem' : '1.1rem',
                                marginBottom: '10px',
                                color: lockScreenMode ? '#fff' : '#333'
                            }}>
                                • {condition.condition}
                                {condition.notes && ` - ${condition.notes}`}
                            </div>
                        ))}
                    </div>
                )}

                {/* Medications */}
                {patient?.medications && patient.medications.length > 0 && (
                    <div style={{
                        marginBottom: '30px',
                        padding: '20px',
                        backgroundColor: lockScreenMode ? '#111' : '#e6f7ff',
                        borderRadius: '8px',
                        border: lockScreenMode ? '2px solid #0088cc' : '2px solid #99d6ff'
                    }}>
                        <div style={{
                            fontSize: lockScreenMode ? '1.5rem' : '1.2rem',
                            color: lockScreenMode ? '#0088cc' : '#006699',
                            marginBottom: '15px',
                            fontWeight: '600'
                        }}>
                            CURRENT MEDICATIONS
                        </div>
                        {patient.medications.map((med, index) => (
                            <div key={index} style={{
                                fontSize: lockScreenMode ? '1.2rem' : '1rem',
                                marginBottom: '10px',
                                color: lockScreenMode ? '#fff' : '#333'
                            }}>
                                • <strong>{med.name}</strong> - {med.dosage} ({med.frequency})
                            </div>
                        ))}
                    </div>
                )}

                {/* Emergency Contacts */}
                {patient?.emergencyContacts && patient.emergencyContacts.length > 0 && (
                    <div style={{
                        marginBottom: '30px',
                        padding: '20px',
                        backgroundColor: lockScreenMode ? '#001a00' : '#e8f5e9',
                        borderRadius: '8px',
                        border: lockScreenMode ? '3px solid #00ff00' : '2px solid #80e080'
                    }}>
                        <div style={{
                            fontSize: lockScreenMode ? '1.8rem' : '1.3rem',
                            color: lockScreenMode ? '#00ff00' : '#2e7d32',
                            marginBottom: '20px',
                            fontWeight: '700',
                            textTransform: 'uppercase'
                        }}>
                            📞 EMERGENCY CONTACTS
                        </div>
                        {patient.emergencyContacts.map((contact, index) => (
                            <div key={index} style={{
                                marginBottom: '20px',
                                padding: '15px',
                                backgroundColor: lockScreenMode ? '#003300' : '#fff',
                                borderRadius: '6px',
                                border: lockScreenMode ? '2px solid #00ff00' : '1px solid #ddd'
                            }}>
                                <div style={{
                                    fontSize: lockScreenMode ? '1.5rem' : '1.2rem',
                                    fontWeight: '700',
                                    marginBottom: '8px',
                                    color: lockScreenMode ? '#fff' : '#000'
                                }}>
                                    {contact.name}
                                </div>
                                <div style={{
                                    fontSize: lockScreenMode ? '1.2rem' : '1rem',
                                    color: lockScreenMode ? '#aaa' : '#666',
                                    marginBottom: '10px'
                                }}>
                                    {contact.relationship}
                                </div>
                                <button
                                    onClick={() => handleCall(contact.phone)}
                                    style={{
                                        width: '100%',
                                        padding: lockScreenMode ? '20px' : '15px',
                                        fontSize: lockScreenMode ? '1.8rem' : '1.3rem',
                                        fontWeight: '700',
                                        backgroundColor: lockScreenMode ? '#00ff00' : '#4CAF50',
                                        color: lockScreenMode ? '#000' : '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontFamily: 'Quicksand, sans-serif'
                                    }}
                                >
                                    📞 CALL: {contact.phone}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                {!lockScreenMode && (
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginTop: '40px',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                flex: '1 1 180px',
                                padding: '15px 30px',
                                backgroundColor: '#666',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: 'Quicksand, sans-serif'
                            }}
                        >
                            🏠 Home
                        </button>
                        <button
                            onClick={() => navigate(`/qr-code/${patientId}`)}
                            style={{
                                flex: '1 1 180px',
                                padding: '15px 30px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: 'Quicksand, sans-serif'
                            }}
                        >
                            📱 View QR Code
                        </button>

                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergencyCard;
