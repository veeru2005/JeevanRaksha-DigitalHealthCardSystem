import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5001/api';

const getHealthId = (p) => {
    if (p.healthId) {
        const hId = p.healthId.toString();
        return `${hId.slice(0, 4)} ${hId.slice(4, 8)} ${hId.slice(8, 12)} ${hId.slice(12, 16)}`;
    }
    if (!p._id) return 'N/A';
    const hash = p._id.toString().replace(/[^0-9]/g, '').padEnd(16, '0').slice(0, 16);
    return `${hash.slice(0, 4)} ${hash.slice(4, 8)} ${hash.slice(8, 12)} ${hash.slice(12, 16)}`;
};

const EditProfile = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const adminRole = localStorage.getItem('adminRole');
    const isAdmin = !!localStorage.getItem('adminToken');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        dob: '',
        fullName: '', // Added fullName
        healthId: '', // Added healthId
        gender: '',
        bloodType: '',
        address: '',
        allergies: [],
        emergencyContacts: [],
        medicalConditions: [],
        medications: []
    });

    const [newAllergy, setNewAllergy] = useState('');
    const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '' });
    const [newCondition, setNewCondition] = useState({ condition: '', diagnosedDate: '', notes: '' });
    const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });

    useEffect(() => {
        fetchPatientData();
    }, [patientId]);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}`);
            const data = await response.json();

            if (data.success) {
                setFormData({
                    dob: (data.data.dob || data.data.dateOfBirth) ? new Date(data.data.dob || data.data.dateOfBirth).toISOString().split('T')[0] : '',
                    fullName: data.data.fullName || '',
                    healthId: getHealthId(data.data),
                    gender: data.data.gender || '',
                    bloodType: data.data.bloodType || data.data.bloodGroup || '',
                    address: data.data.address || '',
                    allergies: data.data.allergies || [],
                    emergencyContacts: data.data.emergencyContacts || [],
                    medicalConditions: data.data.medicalConditions || [],
                    medications: data.data.medications || []
                });
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

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            // Sanitize data before sending
            const sanitizedData = {
                ...formData,
                medicalConditions: formData.medicalConditions.map(c => ({
                    ...c,
                    diagnosedDate: c.diagnosedDate || null
                }))
            };

            const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sanitizedData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Profile updated successfully!');
                // Notify other admin/superadmin tabs to refresh their patient lists
                try {
                    const payload = { id: patientId, timestamp: Date.now() };
                    localStorage.setItem(`patient_updated_${patientId}`, JSON.stringify(payload));
                    // Custom event for same-tab listeners
                    window.dispatchEvent(new CustomEvent('patient-updated', { detail: payload }));
                } catch (err) {
                    console.warn('Could not write patient update to storage', err);
                }

                setTimeout(() => {
                    if (adminRole === 'superadmin') {
                        navigate('/admin/superadmin-dashboard', { state: { activeTab: 'patients' } });
                    } else if (adminRole === 'admin') {
                        navigate('/admin/dashboard', { state: { activeTab: 'patients' } });
                    } else {
                        navigate(`/emergency-card/${patientId}`);
                    }
                }, 800);
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const addAllergy = () => {
        if (newAllergy.trim()) {
            setFormData({
                ...formData,
                allergies: [...formData.allergies, newAllergy.trim()]
            });
            setNewAllergy('');
        }
    };

    const removeAllergy = (index) => {
        setFormData({
            ...formData,
            allergies: formData.allergies.filter((_, i) => i !== index)
        });
    };

    const addContact = () => {
        if (newContact.name && newContact.phone) {
            setFormData({
                ...formData,
                emergencyContacts: [...formData.emergencyContacts, { ...newContact }]
            });
            setNewContact({ name: '', relationship: '', phone: '' });
        }
    };

    const removeContact = (index) => {
        setFormData({
            ...formData,
            emergencyContacts: formData.emergencyContacts.filter((_, i) => i !== index)
        });
    };

    const addCondition = () => {
        if (newCondition.condition) {
            setFormData({
                ...formData,
                medicalConditions: [...formData.medicalConditions, { ...newCondition }]
            });
            setNewCondition({ condition: '', diagnosedDate: '', notes: '' });
        }
    };

    const removeCondition = (index) => {
        setFormData({
            ...formData,
            medicalConditions: formData.medicalConditions.filter((_, i) => i !== index)
        });
    };

    const addMedication = () => {
        if (newMedication.name) {
            setFormData({
                ...formData,
                medications: [...formData.medications, { ...newMedication }]
            });
            setNewMedication({ name: '', dosage: '', frequency: '' });
        }
    };

    const removeMedication = (index) => {
        setFormData({
            ...formData,
            medications: formData.medications.filter((_, i) => i !== index)
        });
    };

    const isReadOnly = !localStorage.getItem('adminToken'); // Only admins can edit

    const handleBack = () => {
        if (adminRole === 'superadmin') {
            navigate('/admin/superadmin-dashboard', { state: { activeTab: 'patients' } });
        } else if (adminRole === 'admin') {
            navigate('/admin/dashboard', { state: { activeTab: 'patients' } });
        } else {
            navigate(`/emergency-card/${patientId}`);
        }
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
                <div>Loading profile...</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa', fontFamily: 'Quicksand, sans-serif' }}>
            {/* Admin Header (Simplified) */}
            {isAdmin && (
                <header style={{
                    backgroundColor: '#1a1a1a', // Dark header for admin feeling
                    color: 'white',
                    padding: '15px 30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src="/Logo.png" alt="Logo" style={{ height: '35px' }} />
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Admin Console</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            {adminRole === 'superadmin' ? 'Super Admin Mode' : 'Admin Mode'}
                        </span>
                        <button
                            onClick={handleBack}
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'background 0.2s',
                                fontWeight: 500
                            }}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </header>
            )}

            <div style={{
                maxWidth: '800px',
                margin: '40px auto',
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    color: 'var(--color-primary-dark)',
                    marginBottom: '10px',
                    fontFamily: 'Quicksand, sans-serif'
                }}>
                    {isReadOnly ? '📋 My Medical Profile' : '✏️ Edit Medical Profile'}
                </h1>
                <p style={{ color: '#666', marginBottom: '30px' }}>
                    {isReadOnly ? 'View medical information available to emergency responders' : 'Update your medical information for emergency responders'}
                </p>

                {/* Messages */}
                {error && (
                    <div style={{
                        padding: '15px',
                        marginBottom: '20px',
                        backgroundColor: '#fee',
                        color: '#c00',
                        borderRadius: '8px',
                        border: '1px solid #fcc'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        padding: '15px',
                        marginBottom: '20px',
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        borderRadius: '8px',
                        border: '1px solid #a5d6a7'
                    }}>
                        {success}
                    </div>
                )}



                {/* Patient Identity Section - Read Only */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            marginBottom: '10px',
                            fontSize: '1.1rem',
                            color: '#333'
                        }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            disabled={true}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '6px',
                                border: '1px solid #ccc',
                                fontSize: '1rem',
                                fontFamily: 'Quicksand, sans-serif',
                                backgroundColor: '#f0f0f0',
                                color: '#555',
                                cursor: 'not-allowed'
                            }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            marginBottom: '10px',
                            fontSize: '1.1rem',
                            color: '#333'
                        }}>
                            Health Card ID
                        </label>
                        <input
                            type="text"
                            value={formData.healthId || 'N/A'}
                            disabled={true}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '6px',
                                border: '1px solid #ccc',
                                fontSize: '1rem',
                                fontFamily: 'Quicksand, sans-serif',
                                backgroundColor: '#f0f0f0',
                                color: '#555',
                                cursor: 'not-allowed',
                                fontWeight: '700'
                            }}
                        />
                    </div>
                </div>

                {/* Blood Type & DOB */}
                {/* Date of Birth & Gender - separated controls */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            marginBottom: '10px',
                            fontSize: '1.1rem',
                            color: '#333'
                        }}>
                            Date of Birth
                        </label>
                        {isReadOnly ? (
                            <div style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '6px',
                                border: '1px solid #ccc',
                                fontSize: '1rem',
                                fontFamily: 'Quicksand, sans-serif',
                                height: '52px',
                                boxSizing: 'border-box',
                                backgroundColor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                color: formData.dob ? '#333' : '#888'
                            }}>
                                {formData.dob ? formData.dob.split('-').reverse().join('/') : 'Not Recorded'}
                            </div>
                        ) : (
                            <input
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'Quicksand, sans-serif',
                                    height: '52px',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white'
                                }}
                            />
                        )}
                    </div>

                    <div style={{ width: '220px' }}>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            marginBottom: '10px',
                            fontSize: '1.1rem',
                            color: '#333'
                        }}>
                            Gender
                        </label>
                        {isReadOnly ? (
                            <div style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '6px',
                                border: '1px solid #ccc',
                                fontSize: '1rem',
                                fontFamily: 'Quicksand, sans-serif',
                                height: '52px',
                                boxSizing: 'border-box',
                                backgroundColor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                color: formData.gender ? '#333' : '#888'
                            }}>
                                {formData.gender || 'Not Recorded'}
                            </div>
                        ) : (
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'Quicksand, sans-serif',
                                    height: '52px',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        )}
                    </div>
                </div>

                {/* Address Field */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{
                        display: 'block',
                        fontWeight: '600',
                        marginBottom: '10px',
                        fontSize: '1.1rem',
                        color: '#333'
                    }}>
                        Address
                    </label>
                    <textarea
                        value={formData.address}
                        disabled={isReadOnly}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter full address"
                        rows="3"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            fontSize: '1rem',
                            fontFamily: 'Quicksand, sans-serif',
                            backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{
                        display: 'block',
                        fontWeight: '600',
                        marginBottom: '10px',
                        fontSize: '1.1rem',
                        color: '#333'
                    }}>
                        Blood Type
                    </label>
                    <select
                        value={formData.bloodType}
                        disabled={isReadOnly}
                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            fontSize: '1rem',
                            fontFamily: 'Quicksand, sans-serif',
                            backgroundColor: isReadOnly ? '#f5f5f5' : 'white'
                        }}
                    >
                        <option value="">Select Blood Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>

                {/* Allergies */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{
                        display: 'block',
                        fontWeight: '600',
                        marginBottom: '10px',
                        fontSize: '1.1rem',
                        color: '#333'
                    }}>
                        Allergies
                    </label>
                    {!isReadOnly && (
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <input
                                type="text"
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                                placeholder="e.g., Penicillin, Peanuts"
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'Quicksand, sans-serif'
                                }}
                            />
                            <button
                                onClick={addAllergy}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontFamily: 'Quicksand, sans-serif',
                                    fontWeight: '600'
                                }}
                            >
                                Add
                            </button>
                        </div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {isReadOnly && formData.allergies.length === 0 && (
                            <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>No allergies recorded.</p>
                        )}
                        {formData.allergies.map((allergy, index) => (
                            <div key={index} style={{
                                padding: '8px 15px',
                                backgroundColor: '#ffebee',
                                color: '#c00',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                border: '1px solid #ffcdd2'
                            }}>
                                <span>{allergy}</span>
                                {!isReadOnly && (
                                    <button
                                        onClick={() => removeAllergy(index)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#c00',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem',
                                            fontWeight: '700'
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Emergency Contacts */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{
                        display: 'block',
                        fontWeight: '600',
                        marginBottom: '10px',
                        fontSize: '1.1rem',
                        color: '#333'
                    }}>
                        Emergency Contacts
                    </label>
                    {!isReadOnly && (
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            marginBottom: '15px'
                        }}>
                            <input
                                type="text"
                                value={newContact.name}
                                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                placeholder="Full Name"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'Quicksand, sans-serif',
                                    marginBottom: '10px'
                                }}
                            />
                            <input
                                type="text"
                                value={newContact.relationship}
                                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                                placeholder="Relationship (e.g., Spouse, Parent)"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'Quicksand, sans-serif',
                                    marginBottom: '10px'
                                }}
                            />
                            <input
                                type="tel"
                                value={newContact.phone}
                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                placeholder="Phone Number"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'Quicksand, sans-serif',
                                    marginBottom: '10px'
                                }}
                            />
                            <button
                                onClick={addContact}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontFamily: 'Quicksand, sans-serif',
                                    fontWeight: '600'
                                }}
                            >
                                Add Emergency Contact
                            </button>
                        </div>
                    )}
                    {isReadOnly && formData.emergencyContacts.length === 0 && (
                        <p style={{ color: '#888', fontStyle: 'italic', padding: '10px 0' }}>No emergency contacts recorded.</p>
                    )}
                    {formData.emergencyContacts.map((contact, index) => (
                        <div key={index} style={{
                            padding: '15px',
                            backgroundColor: '#e8f5e9',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', marginBottom: '5px' }}>{contact.name}</div>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>{contact.relationship}</div>
                                <div style={{ color: '#333', marginTop: '5px' }}>📞 {contact.phone}</div>
                            </div>
                            {!isReadOnly && (
                                <button
                                    onClick={() => removeContact(index)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontFamily: 'Quicksand, sans-serif'
                                    }}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Medical Conditions */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{
                        fontWeight: '700',
                        marginBottom: '15px',
                        fontSize: '1.25rem',
                        color: '#2c3e50',
                        marginTop: '0',
                        borderBottom: '2px solid #eee',
                        paddingBottom: '10px'
                    }}>
                        Patient Diseases / Medical Conditions
                    </h3>
                    {!isReadOnly && (
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            marginBottom: '15px'
                        }}>
                            <input
                                type="text"
                                value={newCondition.condition}
                                onChange={(e) => setNewCondition({ ...newCondition, condition: e.target.value })}
                                placeholder="Condition (e.g., Diabetes, Asthma)"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'Quicksand, sans-serif',
                                    marginBottom: '10px'
                                }}
                            />
                            <textarea
                                value={newCondition.notes}
                                onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                                placeholder="Notes (optional)"
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'Quicksand, sans-serif',
                                    marginBottom: '10px',
                                    resize: 'vertical'
                                }}
                            />
                            <button
                                onClick={addCondition}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#FF9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontFamily: 'Quicksand, sans-serif',
                                    fontWeight: '600'
                                }}
                            >
                                Add Medical Condition
                            </button>
                        </div>
                    )}
                    {isReadOnly && formData.medicalConditions.length === 0 && (
                        <p style={{ color: '#888', fontStyle: 'italic', padding: '10px 0' }}>No medical conditions recorded.</p>
                    )}
                    {formData.medicalConditions.map((condition, index) => {
                        const displayText = typeof condition === 'string' ? condition : condition.condition;
                        const notes = typeof condition === 'string' ? '' : condition.notes;

                        return (
                            <div key={index} style={{
                                padding: '15px',
                                backgroundColor: '#fff8e1',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>{displayText}</div>
                                    {notes && (
                                        <div style={{ color: '#666', fontSize: '0.9rem' }}>{notes}</div>
                                    )}
                                </div>
                                {!isReadOnly && (
                                    <button
                                        onClick={() => removeCondition(index)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontFamily: 'Quicksand, sans-serif'
                                        }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Medications */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{
                        fontWeight: '700',
                        marginBottom: '15px',
                        fontSize: '1.25rem',
                        color: '#2c3e50',
                        marginTop: '0',
                        borderBottom: '2px solid #eee',
                        paddingBottom: '10px'
                    }}>
                        Current Medications
                    </h3>
                    {!isReadOnly && (
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            marginBottom: '15px'
                        }}>
                            <input
                                type="text"
                                value={newMedication.name}
                                onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                                placeholder="Medication Name"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'Quicksand, sans-serif',
                                    marginBottom: '10px'
                                }}
                            />
                            <input
                                type="text"
                                value={newMedication.dosage}
                                onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                                placeholder="Dosage (e.g., 500mg)"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'Quicksand, sans-serif',
                                    marginBottom: '10px'
                                }}
                            />
                            <input
                                type="text"
                                value={newMedication.frequency}
                                onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                                placeholder="Frequency (e.g., Twice daily)"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'Quicksand, sans-serif',
                                    marginBottom: '10px'
                                }}
                            />
                            <button
                                onClick={addMedication}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontFamily: 'Quicksand, sans-serif',
                                    fontWeight: '600'
                                }}
                            >
                                Add Medication
                            </button>
                        </div>
                    )}
                    {isReadOnly && formData.medications.length === 0 && (
                        <p style={{ color: '#888', fontStyle: 'italic', padding: '10px 0' }}>No medications recorded.</p>
                    )}
                    {formData.medications.map((med, index) => {
                        const name = typeof med === 'string' ? med : med.name;
                        const details = typeof med === 'string' ? '' : `${med.dosage || ''} ${med.frequency ? '- ' + med.frequency : ''}`;

                        return (
                            <div key={index} style={{
                                padding: '15px',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>{name}</div>
                                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                        {details}
                                    </div>
                                </div>
                                {!isReadOnly && (
                                    <button
                                        onClick={() => removeMedication(index)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontFamily: 'Quicksand, sans-serif'
                                        }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    marginTop: '40px',
                    paddingTop: '30px',
                    borderTop: '2px solid #eee'
                }}>
                    <button
                        onClick={handleBack}
                        style={{
                            flex: 1,
                            padding: '15px',
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
                        {isReadOnly ? 'Back to Card' : (isAdmin ? 'Back to Dashboard' : 'Cancel')}
                    </button>
                    {!isReadOnly && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                flex: 1,
                                padding: '15px',
                                backgroundColor: saving ? '#ccc' : 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontFamily: 'Quicksand, sans-serif'
                            }}
                        >
                            {saving ? 'Saving...' : '💾 Save Changes'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

};

export default EditProfile;
