import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = 'http://localhost:5001/api';

const QRCodeDisplay = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPatientData();
    }, [patientId]);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}`);
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

    const downloadQRCode = () => {
        const svg = document.getElementById('qr-code-svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            
            const downloadLink = document.createElement('a');
            downloadLink.download = `jeevanraksha-qr-${patient.fullName.replace(/\s+/g, '-')}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const printQRCode = () => {
        window.print();
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
                <div>Loading QR Code...</div>
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

    const emergencyUrl = `${window.location.origin}/emergency/${patient.qrCode}`;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '40px 20px',
            fontFamily: 'Quicksand, sans-serif'
        }}>
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                padding: '40px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    color: 'var(--color-primary-dark)',
                    marginBottom: '10px',
                    fontFamily: 'Quicksand, sans-serif'
                }}>
                    📱 Your JeevanRaksha QR Code
                </h1>
                <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
                    Scan this QR code to instantly access emergency medical information
                </p>

                {/* Patient Info */}
                <div style={{
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    textAlign: 'left'
                }}>
                    <div style={{ marginBottom: '10px' }}>
                        <strong>Name:</strong> {patient.fullName}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <strong>Patient ID:</strong> {patient._id}
                    </div>
                    <div>
                        <strong>QR Code ID:</strong> {patient.qrCode}
                    </div>
                </div>

                {/* QR Code */}
                <div id="qr-code-container" style={{
                    padding: '30px',
                    backgroundColor: '#fff',
                    border: '3px solid var(--color-primary)',
                    borderRadius: '12px',
                    marginBottom: '30px',
                    display: 'inline-block'
                }}>
                    <QRCodeSVG
                        id="qr-code-svg"
                        value={emergencyUrl}
                        size={300}
                        level="H"
                        includeMargin={true}
                        fgColor="#004D40"
                    />
                </div>

                {/* Instructions */}
                <div style={{
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px',
                    textAlign: 'left'
                }}>
                    <h3 style={{
                        fontSize: '1.2rem',
                        color: '#2e7d32',
                        marginBottom: '15px'
                    }}>
                        📋 How to Use
                    </h3>
                    <ul style={{
                        lineHeight: '1.8',
                        paddingLeft: '20px',
                        margin: 0,
                        color: '#333'
                    }}>
                        <li>Save or print this QR code</li>
                        <li>Keep it in your wallet, phone case, or car</li>
                        <li>Emergency responders can scan it to access your medical info</li>
                        <li>No login or password required for emergency access</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={downloadQRCode}
                        className="no-print"
                        style={{
                            flex: '1 1 150px',
                            padding: '15px 30px',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'Quicksand, sans-serif'
                        }}
                    >
                        💾 Download
                    </button>
                    <button
                        onClick={printQRCode}
                        className="no-print"
                        style={{
                            flex: '1 1 150px',
                            padding: '15px 30px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'Quicksand, sans-serif'
                        }}
                    >
                        🖨️ Print
                    </button>
                    <button
                        onClick={() => navigate(`/emergency-card/${patientId}`)}
                        className="no-print"
                        style={{
                            flex: '1 1 150px',
                            padding: '15px 30px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'Quicksand, sans-serif'
                        }}
                    >
                        📋 View Card
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="no-print"
                        style={{
                            flex: '1 1 150px',
                            padding: '15px 30px',
                            backgroundColor: '#666',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'Quicksand, sans-serif'
                        }}
                    >
                        🏠 Home
                    </button>
                </div>

                {/* Print Styles */}
                <style>{`
                    @media print {
                        body {
                            background: white;
                        }
                        .no-print {
                            display: none !important;
                        }
                        #qr-code-container {
                            border: 2px solid #000;
                            page-break-inside: avoid;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default QRCodeDisplay;
