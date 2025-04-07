import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/goals.css'

const Home = () => {
    return (
        <div className="home-container">
            <h1>Welcome to Daility</h1>
            <p className="home-description">
                Track your goals, build habits, and achieve more with our simple and effective goal tracking app.
            </p>

            <div className="home-actions">
                <Link to="/register" className="home-button register">
                    Create Account
                </Link>
                <Link to="/login" className="home-button login">
                    Log In
                </Link>
            </div>

            <div className="home-features">
                <div className="feature-card">
                    <h3>Set Clear Goals</h3>
                    <p>Create and organize your goals with customizable sections and progress tracking.</p>
                </div>
                <div className="feature-card">
                    <h3>Track Progress</h3>
                    <p>Log your daily progress and see your achievements over time with visual statistics.</p>
                </div>
                <div className="feature-card">
                    <h3>Build Streaks</h3>
                    <p>Stay motivated by maintaining streaks and celebrating your consistency.</p>
                </div>
            </div>
        </div>
    )
}

export default Home