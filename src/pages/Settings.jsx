import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../helper/supabaseClient';
import '../styles/goals.css';

function Settings() {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState({
        first_name: '',
        last_name: ''
    });
    const [password, setPassword] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });
    const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error fetching user:', error);
            return;
        }
        if (user) {
            setUserProfile({
                first_name: user.user_metadata.first_name || '',
                last_name: user.user_metadata.last_name || ''
            });
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setProfileMessage({ text: '', type: '' });

        try {
            const { data: { user }, error } = await supabase.auth.updateUser({
                data: {
                    first_name: userProfile.first_name,
                    last_name: userProfile.last_name
                }
            });

            if (error) throw error;

            setProfileMessage({
                text: 'Profile updated successfully!',
                type: 'success'
            });
        } catch (error) {
            setProfileMessage({
                text: error.message,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPasswordMessage({ text: '', type: '' });

        if (password.new !== password.confirm) {
            setPasswordMessage({
                text: 'New passwords do not match',
                type: 'error'
            });
            setLoading(false);
            return;
        }

        try {
            // First, verify the current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: (await supabase.auth.getUser()).data.user.email,
                password: password.current
            });

            if (signInError) {
                setPasswordMessage({
                    text: 'Current password is incorrect',
                    type: 'error'
                });
                setLoading(false);
                return;
            }

            // If current password is correct, proceed with the update
            const { error } = await supabase.auth.updateUser({
                password: password.new
            });

            if (error) throw error;

            setPasswordMessage({
                text: 'Password updated successfully!',
                type: 'success'
            });
            setPassword({ current: '', new: '', confirm: '' });
        } catch (error) {
            setPasswordMessage({
                text: error.message,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button className="back-button" onClick={() => navigate('/goals')}>
                    ← Back to Goals
                </button>
                <h1>Settings</h1>
            </div>

            <div className="settings-section">
                <h2>Profile Settings</h2>
                <form onSubmit={handleProfileUpdate} className="settings-form">
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            value={userProfile.first_name}
                            onChange={(e) => setUserProfile({ ...userProfile, first_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            value={userProfile.last_name}
                            onChange={(e) => setUserProfile({ ...userProfile, last_name: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
                {profileMessage.text && (
                    <div className={`message ${profileMessage.type}`}>
                        {profileMessage.text}
                    </div>
                )}
            </div>

            <div className="settings-section">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordReset} className="settings-form">
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            id="currentPassword"
                            type="password"
                            value={password.current}
                            onChange={(e) => setPassword({ ...password, current: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={password.new}
                            onChange={(e) => setPassword({ ...password, new: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={password.confirm}
                            onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
                {passwordMessage.text && (
                    <div className={`message ${passwordMessage.type}`}>
                        {passwordMessage.text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Settings; 