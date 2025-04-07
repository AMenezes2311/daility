import React, { useState } from 'react';
import supabase from "../helper/supabaseClient";
import { Link, useNavigate } from 'react-router-dom';
import '../styles/goals.css';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            // Create the user with metadata
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName
                    },
                    emailRedirectTo: 'https://amenezes2311.github.io/daility/login'
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // Show success message
                setMessage('Please check your email for the confirmation link.');
                setLoading(false);
            }
        } catch (error) {
            setMessage(error.message);
            console.error('Registration error:', error);
            setLoading(false);
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="auth-container">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    name="firstName"
                    onChange={handleChange}
                    value={formData.firstName}
                    type='text'
                    placeholder='First Name'
                    required
                />
                <input
                    name="lastName"
                    onChange={handleChange}
                    value={formData.lastName}
                    type='text'
                    placeholder='Last Name'
                    required
                />
                <input
                    name="email"
                    onChange={handleChange}
                    value={formData.email}
                    type='email'
                    placeholder='Email'
                    required
                />
                <input
                    name="password"
                    onChange={handleChange}
                    value={formData.password}
                    type='password'
                    placeholder='Password'
                    required
                />
                <button type='submit' disabled={loading}>
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
            {message && <p className={message.includes('check your email') ? 'success-message' : 'error-message'}>{message}</p>}
            <div className="auth-links">
                <p>Already have an account? <Link to='/login'>Log in</Link></p>
            </div>
        </div>
    )
}

export default Register;