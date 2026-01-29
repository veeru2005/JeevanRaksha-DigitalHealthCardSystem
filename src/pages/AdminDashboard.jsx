import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5001';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [adminInfo, setAdminInfo] = useState({
        username: localStorage.getItem('adminUsername') || '',
        role: localStorage.getItem('adminRole') || ''
    });

    const getHealthId = (p) => {
        if (p.healthId) {
            const hId = p.healthId.toString();
            return `${hId.slice(0, 4)} ${hId.slice(4, 8)} ${hId.slice(8, 12)} ${hId.slice(12, 16)}`;
        }
        if (!p._id) return 'N/A';
        const hash = p._id.toString().replace(/[^0-9]/g, '').padEnd(16, '0').slice(0, 16);
        return `${hash.slice(0, 4)} ${hash.slice(4, 8)} ${hash.slice(8, 12)} ${hash.slice(12, 16)}`;
    };

    const filteredPatients = patients.filter(p => {
        const term = searchQuery.toLowerCase();
        const cleanTerm = term.replace(/\s/g, '');
        const hid = getHealthId(p).replace(/\s/g, ''); // raw numbers
        return (
            (p.fullName && p.fullName.toLowerCase().includes(term)) ||
            (p.email && p.email.toLowerCase().includes(term)) ||
            (p.mobileNumber && p.mobileNumber.includes(term)) ||
            (hid.includes(cleanTerm))
        );
    });

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        fetchDashboardData();

        // Listen for patient updates from other tabs or same-window events
        const onStorage = async (e) => {
            try {
                if (e.key && e.key.startsWith('patient_updated_')) {
                    const id = e.key.replace('patient_updated_', '');
                    await fetchDashboardData();
                    if (selectedPatient && selectedPatient._id === id) {
                        // fetch fresh patient data
                        try {
                            const res = await fetch(`${API_BASE_URL}/patients/${id}`);
                            const j = await res.json();
                            if (j.success) setSelectedPatient(j.data);
                        } catch (err) {
                            console.warn('Could not refresh selected patient', err);
                        }
                    }
                }
            } catch (err) {
                console.warn('storage handler error', err);
            }
        };

        const onCustom = async (ev) => {
            try {
                const id = ev?.detail?.id;
                if (id) {
                    await fetchDashboardData();
                    if (selectedPatient && selectedPatient._id === id) {
                        try {
                            const res = await fetch(`${API_BASE_URL}/patients/${id}`);
                            const j = await res.json();
                            if (j.success) setSelectedPatient(j.data);
                        } catch (err) {
                            console.warn('Could not refresh selected patient', err);
                        }
                    }
                }
            } catch (err) {
                console.warn('custom event handler error', err);
            }
        };

        window.addEventListener('storage', onStorage);
        window.addEventListener('patient-updated', onCustom);

        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('patient-updated', onCustom);
        };
    }, []);

    useEffect(() => {
        // if switched to patients, refresh list
        if (activeTab === 'patients') fetchDashboardData();
    }, [activeTab]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('adminToken');

            // Fetch stats
            const statsResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const statsData = await statsResponse.json();
            if (statsData.success) {
                setStats(statsData.stats);
            }

            // Fetch patients
            const patientsResponse = await fetch(`${API_BASE_URL}/api/admin/patients`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const patientsData = await patientsResponse.json();
            if (patientsData.success) {
                setPatients(patientsData.patients);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        const excelData = patients.map(patient => ({
            'Health Card ID': getHealthId(patient),
            'Name': patient.fullName,
            'Gender': patient.gender || 'N/A',
            'Date of Birth': patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A',
            'Email': patient.email,
            'Phone': patient.mobileNumber,
            'Address': patient.address || 'N/A',
            'Blood Group': patient.bloodType || patient.bloodGroup || 'N/A',
            'Allergies': (patient.allergies || []).join(', ') || 'None',
            'Medical Conditions': (patient.medicalConditions || []).map(c => typeof c === 'string' ? c : c.condition || c.name || '').join(', ') || 'None',
            'Medications': (patient.medications || []).map(m => typeof m === 'string' ? m : (m.name || m.medicationName || '') + (m.dosage ? ` (${m.dosage})` : '')).join(', ') || 'None',
            'Registration Date': new Date(patient.createdAt).toLocaleDateString(),
            'Status': patient.isActive ? 'Active' : 'Inactive'
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');

        // Auto-size columns
        const wscols = [
            { wch: 20 }, // Health ID
            { wch: 20 }, // Name
            { wch: 30 }, // Email
            { wch: 15 }, // Phone
            { wch: 10 }, // Blood
            { wch: 20 }, // Allergies
            { wch: 20 }, // Conditions
            { wch: 20 }, // Meds
            { wch: 15 }, // Date
            { wch: 10 }  // Status
        ];
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, `JeevanRaksha_Admin_Patients_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleEditMedicalDetails = (patientId) => {
        navigate(`/edit-profile/${patientId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminPermissions');
        navigate('/login'); // Redirect to main login page
    };

    const viewPatientDetails = (patient) => {
        setSelectedPatient(patient);
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f7fa'
            }}>
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        border: '5px solid #ddd',
                        borderTop: '5px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
            {/* Header with Navigation */}
            <header style={{
                backgroundColor: '#667eea',
                color: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '15px 40px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src="/Logo.png" alt="Logo" style={{ height: '45px' }} />
                        <div>
                            <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '700' }}>
                                Admin Dashboard
                            </h1>
                        </div>
                    </div>

                    {/* Navigation Tabs in Header */}
                    <nav style={{ display: 'flex', gap: '5px' }}>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: activeTab === 'dashboard' ? 'rgba(255,255,255,0.25)' : 'transparent',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('patients')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: activeTab === 'patients' ? 'rgba(255,255,255,0.25)' : 'transparent',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}
                        >
                            👥 Patients ({patients.length})
                        </button>
                    </nav>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            ADMIN
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: '2px solid white',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#667eea';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                e.target.style.color = 'white';
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && stats && (
                    <div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '25px',
                            marginBottom: '40px'
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '30px',
                                borderRadius: '12px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                borderLeft: '4px solid #667eea'
                            }}>
                                <h3 style={{ fontSize: '2.5rem', margin: '0 0 10px', color: '#667eea', fontWeight: '700' }}>
                                    {stats.totalPatients}
                                </h3>
                                <p style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>Total Patients</p>
                            </div>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '30px',
                                borderRadius: '12px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                borderLeft: '4px solid #26de81'
                            }}>
                                <h3 style={{ fontSize: '2.5rem', margin: '0 0 10px', color: '#26de81', fontWeight: '700' }}>
                                    {stats.totalAdmins}
                                </h3>
                                <p style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>Total Admins</p>
                            </div>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '30px',
                                borderRadius: '12px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                borderLeft: '4px solid #fc5c65'
                            }}>
                                <h3 style={{ fontSize: '2.5rem', margin: '0 0 10px', color: '#fc5c65', fontWeight: '700' }}>
                                    {stats.activeAdmins}
                                </h3>
                                <p style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>Active Admins</p>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            padding: '30px'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontWeight: '700' }}>Recent Registrations</h3>
                            {stats.recentPatients?.map((p, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx < stats.recentPatients.length - 1 ? '1px solid #eee' : 'none', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{p.fullName}</div>
                                        <div style={{ color: '#666', fontSize: '0.9rem' }}>{p.email} • {p.mobileNumber}</div>
                                    </div>
                                    <div>
                                        <span style={{
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.9rem',
                                            fontWeight: '700'
                                        }}>
                                            {p.bloodType || p.bloodGroup || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Patients Tab */}
                {activeTab === 'patients' && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '25px 30px',
                            borderBottom: '1px solid #eee',
                            backgroundColor: '#fafbfc',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#333' }}>
                                Registered Patients
                            </h2>
                            <button
                                onClick={() => exportToExcel()}
                                style={{
                                    padding: '10px 18px',
                                    backgroundColor: '#26de81',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                📥 Download Excel
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div style={{ padding: '15px 30px', borderBottom: '1px solid #eee', backgroundColor: 'white' }}>
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, or health ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse'
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', color: '#495057' }}>Health Card ID</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', color: '#495057' }}>Name</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', color: '#495057' }}>Email</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', color: '#495057' }}>Phone</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', color: '#495057' }}>Blood Group</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600', color: '#495057' }}>Registration</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: '600', color: '#495057' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((patient, index) => (
                                        <tr key={patient._id} style={{
                                            borderBottom: '1px solid #eee',
                                            transition: 'background-color 0.2s'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '15px 20px', fontFamily: 'monospace', fontWeight: '600', color: '#555' }}>
                                                {getHealthId(patient)}
                                            </td>
                                            <td style={{ padding: '15px 20px' }}>{patient.fullName}</td>
                                            <td style={{ padding: '15px 20px' }}>{patient.email}</td>
                                            <td style={{ padding: '15px 20px' }}>{patient.mobileNumber}</td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <span style={{
                                                    backgroundColor: '#667eea',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {patient.bloodType || patient.bloodGroup || 'N/A'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px 20px', fontSize: '0.9rem', color: '#666' }}>
                                                {new Date(patient.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => viewPatientDetails(patient)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: '#667eea',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600',
                                                        transition: 'background-color 0.3s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Patient Details Modal */}
            {selectedPatient && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}
                    onClick={() => setSelectedPatient(null)}
                >
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        maxWidth: '700px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '25px 30px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#667eea',
                            color: 'white'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                                Patient Details
                            </h2>
                            <button
                                onClick={() => setSelectedPatient(null)}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    width: '35px',
                                    height: '35px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ padding: '30px' }}>
                            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                                <button
                                    onClick={() => handleEditMedicalDetails(selectedPatient._id)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#ff9800',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    ✏️ Edit Medical Details
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Health Card ID</p>
                                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', fontFamily: 'monospace', color: '#333' }}>{getHealthId(selectedPatient)}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Full Name</p>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{selectedPatient.fullName}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Blood Group</p>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{selectedPatient.bloodType || selectedPatient.bloodGroup || 'N/A'}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Email</p>
                                    <p style={{ margin: 0, fontSize: '1rem' }}>{selectedPatient.email}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Mobile</p>
                                    <p style={{ margin: 0, fontSize: '1rem' }}>{selectedPatient.mobileNumber}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Date of Birth</p>
                                    <p style={{ margin: 0, fontSize: '1rem' }}>{selectedPatient.dob}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Gender</p>
                                    <p style={{ margin: 0, fontSize: '1rem' }}>{selectedPatient.gender}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '25px' }}>
                                <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Address</p>
                                <p style={{ margin: 0, fontSize: '1rem' }}>{selectedPatient.address}</p>
                            </div>

                            {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                                <div style={{ marginTop: '25px' }}>
                                    <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Allergies</p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {selectedPatient.allergies.map((allergy, index) => (
                                            <span key={index} style={{
                                                backgroundColor: '#fee',
                                                color: '#c33',
                                                padding: '6px 12px',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                {allergy}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedPatient.medicalConditions && selectedPatient.medicalConditions.length > 0 && (
                                <div style={{ marginTop: '25px' }}>
                                    <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Medical Conditions</p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {selectedPatient.medicalConditions.map((cond, idx) => (
                                            <span key={idx} style={{
                                                backgroundColor: '#fff8e1',
                                                color: '#8a6d3b',
                                                padding: '6px 12px',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                {typeof cond === 'string' ? cond : (cond.condition || cond.name || '')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedPatient.medications && selectedPatient.medications.length > 0 && (
                                <div style={{ marginTop: '25px' }}>
                                    <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Medications</p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {selectedPatient.medications.map((med, index) => {
                                            const name = typeof med === 'string' ? med : (med.name || med.medicationName || '');
                                            const dosage = med && typeof med === 'object' ? (med.dosage || med.strength || '') : '';
                                            const label = dosage ? `${name} (${dosage})` : name;
                                            return (
                                                <span key={index} style={{
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#1976d2',
                                                    padding: '6px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedPatient.emergencyContacts && selectedPatient.emergencyContacts.length > 0 && (
                                <div style={{ marginTop: '25px' }}>
                                    <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Emergency Contacts</p>
                                    {selectedPatient.emergencyContacts.map((contact, index) => (
                                        <div key={index} style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            marginBottom: '8px'
                                        }}>
                                            <p style={{ margin: '0 0 5px', fontWeight: '600' }}>{contact.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{contact.phone} • {contact.relationship || contact.relation || ''}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default AdminDashboard;
