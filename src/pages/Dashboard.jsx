import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../helper/supabaseClient';
import '../styles/dashboard.css';

function Dashboard() {
    const [goals, setGoals] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        fetchGoals();
        fetchUserProfile();
    }, []);

    const fetchGoals = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('goals')
            .select('*, sections(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3); // Only fetch the 3 most recent goals for the dashboard

        if (error) {
            console.error('Error fetching goals:', error);
            return;
        }

        setGoals(data || []);
    };

    const fetchUserProfile = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!user) {
            console.error('No user found');
            return;
        }

        if (error) {
            console.error('Error fetching user profile:', error);
            return;
        }

        setUserProfile({
            first_name: user.user_metadata.first_name,
            last_name: user.user_metadata.last_name
        });
    };

    const formatStatus = (status) => {
        switch (status) {
            case 'not_started':
                return 'Not Started';
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome, {userProfile?.first_name || 'User'}!</h1>
                <p className="dashboard-subtitle">Here's an overview of your progress</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card goals-summary">
                    <div className="card-header">
                        <h2>Recent Goals</h2>
                        <Link to="/goals" className="view-all-link">View All</Link>
                    </div>
                    <div className="goals-list">
                        {goals.length === 0 ? (
                            <p className="no-goals">No goals yet. Start by creating one!</p>
                        ) : (
                            goals.map((goal) => (
                                <div key={goal.id} className="goal-item">
                                    <div className="goal-info">
                                        <h3>{goal.title}</h3>
                                        <span className={`status-badge ${goal.status}`}>
                                            {formatStatus(goal.status)}
                                        </span>
                                    </div>
                                    <Link to={`/goals/${goal.id}`} className="view-details-link">
                                        View Details
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="dashboard-card quick-stats">
                    <h2>Quick Stats</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <h3>Active Goals</h3>
                            <p>{goals.filter(g => g.status === 'in_progress').length}</p>
                        </div>
                        <div className="stat-item">
                            <h3>Completed</h3>
                            <p>{goals.filter(g => g.status === 'completed').length}</p>
                        </div>
                        <div className="stat-item">
                            <h3>Not Started</h3>
                            <p>{goals.filter(g => g.status === 'not_started').length}</p>
                        </div>
                    </div>
                </div>

                {/* Placeholder for future features */}
                <div className="dashboard-card coming-soon">
                    <h2>Coming Soon</h2>
                    <p>More features and insights coming to your dashboard!</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;