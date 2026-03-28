import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../services/api';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        monthlyIncome: 0,
        savingsGoal: 0
    });
    const [showEditForm, setShowEditForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            setUser(response.data.user);
            setProfile(response.data.user.profile);
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 401) {
                navigate('/signin');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await updateProfile(profile);
            setSuccess('Profile updated successfully!');
            setProfile(response.data.profile);
            setShowEditForm(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: parseFloat(e.target.value) || 0
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/signin');
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>My Profile</h2>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="profile-card">
                <div className="profile-info">
                    <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">{user?.email}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Role</span>
                        <span className="info-value capitalize">{user?.role}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Monthly Income</span>
                        <span className="info-value">${profile.monthlyIncome?.toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Savings Goal</span>
                        <span className="info-value">${profile.savingsGoal?.toLocaleString()}</span>
                    </div>
                </div>

                {!showEditForm ? (
                    <button className="edit-btn" onClick={() => setShowEditForm(true)}>
                        Edit Profile
                    </button>
                ) : (
                    <form onSubmit={handleUpdateProfile} className="edit-form">
                        <div className="form-group">
                            <label>Monthly Income ($)</label>
                            <input
                                type="number"
                                name="monthlyIncome"
                                value={profile.monthlyIncome}
                                onChange={handleChange}
                                min="0"
                                step="100"
                            />
                        </div>
                        <div className="form-group">
                            <label>Savings Goal ($)</label>
                            <input
                                type="number"
                                name="savingsGoal"
                                value={profile.savingsGoal}
                                onChange={handleChange}
                                min="0"
                                step="100"
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-btn" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" className="cancel-btn" onClick={() => setShowEditForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;