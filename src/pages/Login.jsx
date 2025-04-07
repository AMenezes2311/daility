import React, { useState } from 'react';
import supabase from "../helper/supabaseClient";
import { Link, useNavigate } from 'react-router-dom';
import '../styles/goals.css';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            setMessage(error.message);
            setEmail('');
            setPassword('');
            return;
        }

        if (data) {
            navigate('/goals');
            return null;
        }
    }

    return (
        <div className="auth-container">
            <h2>Welcome Back</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type='email'
                    placeholder='Email'
                    required
                />
                <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type='password'
                    placeholder='Password'
                    required
                />
                <button type='submit'>Log in</button>
            </form>
            {message && <p className="error-message">{message}</p>}
            <div className="auth-links">
                <p>Don't have an account? <Link to='/register'>Register</Link></p>
            </div>
        </div>
    )
}

export default Login