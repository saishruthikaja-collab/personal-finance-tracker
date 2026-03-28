import React, { useState } from 'react';
import './Backup.css';

const Backup = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleGoogleDrive = () => {
        setLoading(true);
        setMessage('Connecting to Google Drive...');
        
        // Simulate backup (you would need OAuth for real Google Drive integration)
        setTimeout(() => {
            setMessage('✅ Google Drive backup completed! (Demo)');
            setLoading(false);
        }, 1500);
    };

    const handleDropbox = () => {
        setLoading(true);
        setMessage('Connecting to Dropbox...');
        
        // Simulate backup (you would need OAuth for real Dropbox integration)
        setTimeout(() => {
            setMessage('✅ Dropbox backup completed! (Demo)');
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="backup-container">
            <h2>Backup Data</h2>
            <p className="backup-subtitle">Store your financial data securely in the cloud</p>

            {message && <div className="backup-message">{message}</div>}

            <div className="backup-cards">
                <div className="backup-card">
                    <div className="backup-icon">☁️</div>
                    <h3>Google Drive</h3>
                    <p>Backup your transactions to Google Drive</p>
                    <button 
                        className="backup-btn google"
                        onClick={handleGoogleDrive}
                        disabled={loading}
                    >
                        Backup to Google Drive
                    </button>
                </div>

                <div className="backup-card">
                    <div className="backup-icon">📁</div>
                    <h3>Dropbox</h3>
                    <p>Backup your transactions to Dropbox</p>
                    <button 
                        className="backup-btn dropbox"
                        onClick={handleDropbox}
                        disabled={loading}
                    >
                        Backup to Dropbox
                    </button>
                </div>
            </div>

            <div className="backup-note">
                <p>📌 Note: This is a demo. In production, you would need OAuth authentication with Google and Dropbox APIs.</p>
            </div>
        </div>
    );
};

export default Backup;