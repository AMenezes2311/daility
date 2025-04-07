import React from 'react';
import supabase from "../helper/supabaseClient";
import { Navigate, Link } from 'react-router';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        navigate('/login')
    }

    return (
        <div className="dashboard">
            <h1>Welcome to Your Dashboard</h1>
            <div className="dashboard-actions">
                <Link to="/goals" className="dashboard-link">
                    <button>View My Goals</button>
                </Link>
                <button onClick={signOut}>Sign out</button>
            </div>
        </div>
    )
}

export default Dashboard;