import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';

const API_BASE_URL = 'http://localhost:5001';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
    const [patients, setPatients] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showEditAdminModal, setShowEditAdminModal] = useState(false);
    const [adminToEdit, setAdminToEdit] = useState(null);
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        username: '',
        email: '',
        password: '',
        role: 'admin',
        permissions: {
            viewPatients: true,
            editPatients: false,
            deletePatients: false,
            viewMedicalRecords: true,
            editMedicalRecords: false,
            manageAdmins: false,
            viewReports: true,
            systemSettings: false
        }
    });
    const [adminInfo, setAdminInfo] = useState({
        username: localStorage.getItem('adminUsername') || '',
        role: localStorage.getItem('adminRole') || ''
    });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [confirmData, setConfirmData] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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
        const hid = getHealthId(p).replace(/\s/g, '');
        return (
            (p.fullName && p.fullName.toLowerCase().includes(term)) ||
            (p.email && p.email.toLowerCase().includes(term)) ||
            (p.mobileNumber && p.mobileNumber.includes(term)) ||
            (hid.includes(cleanTerm))
        );
    });

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const role = localStorage.getItem('adminRole');

        if (!token || role !== 'superadmin') {
            navigate('/admin/login');
            return;
        }

        fetchDashboardData();

        // Listen for patient updates (from other tabs or this tab)
        const onStorage = async (e) => {
            try {
                if (e.key && e.key.startsWith('patient_updated_')) {
                    const id = e.key.replace('patient_updated_', '');
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

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('adminToken');

            // Fetch stats
            const statsResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsResponse.json();
            if (statsData.success) setStats(statsData.stats);

            // Fetch patients
            const patientsResponse = await fetch(`${API_BASE_URL}/api/admin/patients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const patientsData = await patientsResponse.json();
            if (patientsData.success) setPatients(patientsData.patients);

            // Fetch admins
            const adminsResponse = await fetch(`${API_BASE_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const adminsData = await adminsResponse.json();
            if (adminsData.success) setAdmins(adminsData.admins);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login'); // Redirect to main login page
    };

    // Excel Export Function
    const exportToExcel = () => {
        const excelData = patients.map(patient => {
            const meds = (patient.medications || []).map(m => {
                if (!m) return '';
                if (typeof m === 'string') return m;
                // object shape
                const name = m.name || m.medicationName || '';
                const dosage = m.dosage || m.strength || '';
                return dosage ? `${name} (${dosage})` : name;
            }).filter(Boolean).join(', ');

            const conditions = (patient.medicalConditions || []).map(c => {
                if (!c) return '';
                if (typeof c === 'string') return c;
                return c.condition || c.name || '';
            }).filter(Boolean).join(', ');

            return {
                'Health Card ID': getHealthId(patient),
                'Name': patient.fullName,
                'Gender': patient.gender || 'N/A',
                'Date of Birth': patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A',
                'Email': patient.email,
                'Phone': patient.mobileNumber,
                'Address': patient.address || 'N/A',
                'Blood Type': patient.bloodType || 'N/A',
                'Allergies': (patient.allergies || []).join(', ') || 'None',
                'Medical Conditions': conditions || 'None',
                'Medications': meds || 'None',
                'Emergency Contacts': (patient.emergencyContacts || []).map(c => typeof c === 'string' ? c : `${c.name} (${c.phone})`).join(', ') || 'None',
                'Registration Date': new Date(patient.createdAt).toLocaleDateString(),
                'Status': patient.isActive ? 'Active' : 'Inactive'
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');

        // Auto-size columns
        const colWidths = [
            { wch: 20 }, // Health ID
            { wch: 20 }, // Name
            { wch: 30 }, // Email
            { wch: 15 }, // Phone
            { wch: 12 }, // Blood Type
            { wch: 25 }, // Allergies
            { wch: 30 }, // Medical Conditions
            { wch: 30 }, // Medications
            { wch: 30 }, // Emergency Contacts
            { wch: 15 }, // Registration Date
            { wch: 10 }  // Status
        ];
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, `JeevanRaksha_Patients_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleDeletePatient = (patientId) => {
        setConfirmData({ type: 'patient', id: patientId, message: 'Are you sure you want to delete this patient? This action cannot be undone.' });
        setConfirmOpen(true);
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/api/admin/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newAdmin)
            });

            const data = await response.json();
            if (data.success) {
                alert('Admin created successfully!');
                setShowCreateAdmin(false);
                setNewAdmin({
                    username: '',
                    email: '',
                    password: '',
                    role: 'admin',
                    permissions: {
                        viewPatients: true,
                        editPatients: false,
                        deletePatients: false,
                        viewMedicalRecords: true,
                        editMedicalRecords: false,
                        manageAdmins: false,
                        viewReports: true,
                        systemSettings: false
                    }
                });
                fetchDashboardData();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            alert('Failed to create admin');
        }
    };

    const handleDeleteAdmin = (adminId) => {
        setConfirmData({ type: 'admin', id: adminId, message: 'Are you sure you want to delete this admin?' });
        setConfirmOpen(true);
    };

    const performDelete = async () => {
        if (!confirmData) return;
        setConfirmLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            if (confirmData.type === 'patient') {
                const response = await fetch(`${API_BASE_URL}/api/admin/patients/${confirmData.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    alert('Patient deleted successfully');
                    fetchDashboardData();
                } else {
                    alert('Error: ' + (data.error || data.message || 'Failed to delete'));
                }
            } else if (confirmData.type === 'admin') {
                const response = await fetch(`${API_BASE_URL}/api/admin/delete/${confirmData.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    alert('Admin deleted successfully!');
                    fetchDashboardData();
                } else {
                    alert('Error: ' + (data.error || data.message || 'Failed to delete'));
                }
            }
        } catch (err) {
            console.error('Error performing delete:', err);
            alert('Failed to delete.');
        } finally {
            setConfirmLoading(false);
            setConfirmOpen(false);
            setConfirmData(null);
        }
    };

    const toggleAdminStatus = async (adminId, currentStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/api/admin/update/${adminId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            const data = await response.json();
            if (data.success) {
                fetchDashboardData();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error updating admin status:', error);
        }
    };

    const handleSaveAdmin = async () => {
        if (!adminToEdit) return;
        try {
            const token = localStorage.getItem('adminToken');
            const payload = {
                role: adminToEdit.role,
                isActive: adminToEdit.isActive,
                permissions: adminToEdit.permissions
            };

            const response = await fetch(`${API_BASE_URL}/api/admin/update/${adminToEdit._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                alert('Admin updated successfully');
                setShowEditAdminModal(false);
                setAdminToEdit(null);
                fetchDashboardData();
            } else {
                alert('Error: ' + (data.error || data.message || 'Failed to update'));
            }
        } catch (err) {
            console.error('Error updating admin:', err);
            alert('Failed to update admin');
        }
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
            {confirmOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ backgroundColor: 'white', padding: '22px', borderRadius: '10px', width: '400px', maxWidth: '90%', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ marginTop: 0 }}>{confirmData?.type === 'patient' ? 'Delete Patient' : 'Delete Admin'}</h3>
                        <p style={{ color: '#444' }}>{confirmData?.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
                            <button onClick={() => { setConfirmOpen(false); setConfirmData(null); }} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={performDelete} disabled={confirmLoading} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#e74c3c', color: 'white', cursor: 'pointer' }}>{confirmLoading ? 'Deleting...' : 'Delete'}</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header with Navigation */}
            <header style={{
                backgroundColor: '#764ba2',
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
                                Super Admin Dashboard
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
                                fontSize: '0.95rem',
                                transition: 'all 0.3s'
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
                                fontSize: '0.95rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            👥 Patients ({patients.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('admins')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: activeTab === 'admins' ? 'rgba(255,255,255,0.25)' : 'transparent',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            🔐 Admin Management ({admins.filter(a => a.role !== 'superadmin').length})
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
                            ⭐ SUPER ADMIN
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
                                e.target.style.color = '#764ba2';
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
                        <h2 style={{ fontSize: '2rem', marginBottom: '30px', fontWeight: '700' }}>
                            System Overview
                        </h2>
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

                        {/* Recent Patients */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            padding: '30px'
                        }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '700' }}>
                                Recent Registrations
                            </h3>
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
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '30px'
                        }}>
                            <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: '700' }}>
                                All Patients
                            </h2>
                            <button
                                onClick={exportToExcel}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#26de81',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 12px rgba(38, 222, 129, 0.3)',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                📥 Download Excel
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div style={{ marginBottom: '20px' }}>
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
                                    outline: 'none',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                                }}
                            />
                        </div>

                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            overflow: 'hidden'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Health Card ID</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Name</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Email</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Phone</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Blood Type</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Registration Date</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '15px 20px', fontFamily: 'monospace', fontWeight: '600', color: '#555' }}>
                                                {getHealthId(patient)}
                                            </td>
                                            <td style={{ padding: '15px 20px' }}>{patient.fullName}</td>
                                            <td style={{ padding: '15px 20px' }}>{patient.email}</td>
                                            <td style={{ padding: '15px 20px' }}>{patient.mobileNumber}</td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <span style={{
                                                    backgroundColor: '#764ba2',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {patient.bloodType || 'N/A'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px 20px', fontSize: '0.9rem', color: '#666' }}>
                                                {new Date(patient.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => { setSelectedPatient(patient); setShowPatientModal(true); }}
                                                        style={{
                                                            padding: '8px 12px',
                                                            backgroundColor: '#3498db',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePatient(patient._id)}
                                                        style={{
                                                            padding: '8px 12px',
                                                            backgroundColor: '#e74c3c',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Admins Tab */}
                {activeTab === 'admins' && (
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '30px'
                        }}>
                            <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: '700' }}>
                                Admin Management
                            </h2>
                            <button
                                onClick={() => setShowCreateAdmin(true)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#26de81',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 12px rgba(38, 222, 129, 0.3)',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                + Create New Admin
                            </button>
                        </div>

                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            overflow: 'hidden'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Username</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Email</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Role</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Status</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Last Login</th>
                                        <th style={{ padding: '15px 20px', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.filter(admin => admin.role !== 'superadmin').map((admin) => (
                                        <tr key={admin._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '15px 20px', fontWeight: '600' }}>{admin.username}</td>
                                            <td style={{ padding: '15px 20px' }}>{admin.email}</td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <span style={{
                                                    backgroundColor: '#667eea',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}>
                                                    Admin
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <span style={{
                                                    backgroundColor: admin.isActive ? '#d4edda' : '#f8d7da',
                                                    color: admin.isActive ? '#155724' : '#721c24',
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {admin.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px 20px', fontSize: '0.9rem', color: '#666' }}>
                                                {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => { setAdminToEdit(admin); setShowEditAdminModal(true); }}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#17a2b8',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => toggleAdminStatus(admin._id, admin.isActive)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: admin.isActive ? '#ffc107' : '#28a745',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        {admin.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAdmin(admin._id)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#dc3545',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Create Admin Modal */}
            {showCreateAdmin && (
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
                    onClick={() => setShowCreateAdmin(false)}
                >
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        maxWidth: '600px',
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
                            backgroundColor: '#764ba2',
                            color: 'white'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                                Create New Admin
                            </h2>
                            <button
                                onClick={() => setShowCreateAdmin(false)}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    width: '35px',
                                    height: '35px',
                                    borderRadius: '50%'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateAdmin} style={{ padding: '30px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Username</label>
                                <input
                                    type="text"
                                    value={newAdmin.username}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email</label>
                                <input
                                    type="email"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Password</label>
                                <input
                                    type="password"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    required
                                    minLength="8"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Role</label>
                                <select
                                    value={newAdmin.role}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '1.1rem' }}>
                                    Permissions
                                </label>
                                {Object.keys(newAdmin.permissions).map((permission) => (
                                    <div key={permission} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            id={permission}
                                            checked={newAdmin.permissions[permission]}
                                            onChange={(e) => setNewAdmin({
                                                ...newAdmin,
                                                permissions: {
                                                    ...newAdmin.permissions,
                                                    [permission]: e.target.checked
                                                }
                                            })}
                                            style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor={permission} style={{ cursor: 'pointer', fontSize: '0.95rem' }}>
                                            {permission.replace(/([A-Z])/g, ' $1').trim()}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    backgroundColor: '#26de81',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(38, 222, 129, 0.3)'
                                }}
                            >
                                Create Admin
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Patient Details Modal */}
            {showPatientModal && selectedPatient && (
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
                }} onClick={() => { setShowPatientModal(false); setSelectedPatient(null); }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        maxWidth: '700px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            padding: '25px 30px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#764ba2',
                            color: 'white'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                                Patient Details
                            </h2>
                            <button
                                onClick={() => { setShowPatientModal(false); setSelectedPatient(null); }}
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
                                    onClick={() => navigate(`/edit-profile/${selectedPatient._id}`)}
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
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{selectedPatient.bloodType || 'N/A'}</p>
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
                                    <p style={{ margin: 0, fontSize: '1rem' }}>{selectedPatient.dob || ''}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Gender</p>
                                    <p style={{ margin: 0, fontSize: '1rem' }}>{selectedPatient.gender || ''}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '25px' }}>
                                <p style={{ margin: '0 0 5px', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Address</p>
                                <p style={{ margin: 0, fontSize: '1rem' }}>{selectedPatient.address || ''}</p>
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

            {/* Edit Admin Modal */}
            {showEditAdminModal && adminToEdit && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => { setShowEditAdminModal(false); setAdminToEdit(null); }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '720px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#764ba2', color: 'white' }}>
                            <h3 style={{ margin: 0 }}>Edit Admin — {adminToEdit.username}</h3>
                            <button onClick={() => { setShowEditAdminModal(false); setAdminToEdit(null); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '34px', height: '34px' }}>×</button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Role</label>
                                <select value={adminToEdit.role} onChange={(e) => setAdminToEdit({ ...adminToEdit, role: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Status</label>
                                <select value={adminToEdit.isActive ? 'active' : 'inactive'} onChange={(e) => setAdminToEdit({ ...adminToEdit, isActive: e.target.value === 'active' })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Permissions</label>
                                {Object.keys(adminToEdit.permissions || {}).map((perm) => (
                                    <div key={perm} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <input type="checkbox" checked={!!adminToEdit.permissions[perm]} onChange={(e) => setAdminToEdit({ ...adminToEdit, permissions: { ...adminToEdit.permissions, [perm]: e.target.checked } })} style={{ marginRight: '10px' }} />
                                        <label style={{ textTransform: 'capitalize' }}>{perm.replace(/([A-Z])/g, ' $1').trim()}</label>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                                <button onClick={() => { setShowEditAdminModal(false); setAdminToEdit(null); }} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'white' }}>Cancel</button>
                                <button onClick={handleSaveAdmin} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', background: '#26de81', color: 'white', fontWeight: 600 }}>Save Changes</button>
                            </div>
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

export default SuperAdminDashboard;
