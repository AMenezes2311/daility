import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../helper/supabaseClient';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/goals.css';

function Goals() {
    const navigate = useNavigate();
    const [goals, setGoals] = useState([]);
    const [sections, setSections] = useState([]);
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        target_date: '',
        expected_duration: '',
        duration_type: 'days', // 'days' or 'end_date'
        priority: 'medium',
        section_id: null
    });
    const [newSection, setNewSection] = useState({
        title: '',
        description: ''
    });
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showSectionForm, setShowSectionForm] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({
        isOpen: false,
        goalId: null,
        goalTitle: ''
    });
    const [doneDialog, setDoneDialog] = useState({
        isOpen: false,
        goalId: null,
        goalTitle: ''
    });
    const [startProgressDialog, setStartProgressDialog] = useState({
        isOpen: false,
        goalId: null,
        goalTitle: ''
    });
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        fetchGoals();
        fetchSections();
        fetchUserProfile();
    }, []);

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

    const fetchGoals = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('goals')
            .select('*, sections(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching goals:', error);
            return;
        }

        setGoals(data || []);
    };

    const fetchSections = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('sections')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching sections:', error);
            return;
        }

        setSections(data || []);
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

        // Set user profile from user metadata
        setUserProfile({
            first_name: user.user_metadata.first_name,
            last_name: user.user_metadata.last_name
        });
    };

    const handleGoalSubmit = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Calculate target date if duration is provided
        let targetDate = newGoal.target_date;
        let expectedDuration = null;

        if (newGoal.duration_type === 'days' && newGoal.expected_duration) {
            const startDate = new Date(newGoal.start_date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + parseInt(newGoal.expected_duration));
            targetDate = endDate.toISOString().split('T')[0];
            expectedDuration = parseInt(newGoal.expected_duration);
        } else if (newGoal.duration_type === 'end_date' && newGoal.target_date) {
            const startDate = new Date(newGoal.start_date);
            const endDate = new Date(newGoal.target_date);
            const diffTime = Math.abs(endDate - startDate);
            expectedDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Create a new object without the duration_type field
        const { duration_type, ...goalDataWithoutType } = newGoal;

        const goalData = {
            ...goalDataWithoutType,
            target_date: targetDate,
            expected_duration: expectedDuration,
            user_id: user.id,
            status: 'not_started'
        };

        const { data, error } = await supabase
            .from('goals')
            .insert([goalData])
            .select();

        if (error) {
            console.error('Error creating goal:', error);
            return;
        }

        setGoals([data[0], ...goals]);
        setShowGoalForm(false);
        setNewGoal({
            title: '',
            description: '',
            start_date: new Date().toISOString().split('T')[0],
            target_date: '',
            expected_duration: '',
            duration_type: 'days',
            priority: 'medium',
            section_id: null
        });
    };

    const handleSectionSubmit = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('sections')
            .insert([
                {
                    ...newSection,
                    user_id: user.id
                }
            ])
            .select();

        if (error) {
            console.error('Error creating section:', error);
            return;
        }

        setSections([data[0], ...sections]);
        setShowSectionForm(false);
        setNewSection({
            title: '',
            description: ''
        });
    };

    const handleDeleteClick = (e, goalId, goalTitle) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Prevent event bubbling
        setDeleteDialog({
            isOpen: true,
            goalId,
            goalTitle
        });
    };

    const handleDeleteConfirm = async () => {
        const { error } = await supabase.rpc('delete_goal_with_dependencies', {
            p_goal_id: deleteDialog.goalId
        });

        if (error) {
            console.error('Error deleting goal:', error);
            return;
        }

        setGoals(goals.filter(goal => goal.id !== deleteDialog.goalId));
        setDeleteDialog({ isOpen: false, goalId: null, goalTitle: '' });
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ isOpen: false, goalId: null, goalTitle: '' });
    };

    const handleDoneClick = (e, goalId, goalTitle) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Prevent event bubbling
        setDoneDialog({
            isOpen: true,
            goalId,
            goalTitle
        });
    };

    const handleDoneConfirm = async () => {
        const { error } = await supabase
            .from('goals')
            .update({ status: 'completed' })
            .eq('id', doneDialog.goalId);

        if (error) {
            console.error('Error updating goal status:', error);
            return;
        }

        // Update the goals list with the new status
        setGoals(goals.map(goal =>
            goal.id === doneDialog.goalId
                ? { ...goal, status: 'completed' }
                : goal
        ));
        setDoneDialog({ isOpen: false, goalId: null, goalTitle: '' });
    };

    const handleDoneCancel = () => {
        setDoneDialog({ isOpen: false, goalId: null, goalTitle: '' });
    };

    const handleStartProgressClick = (e, goalId, goalTitle) => {
        e.preventDefault();
        e.stopPropagation();
        setStartProgressDialog({
            isOpen: true,
            goalId,
            goalTitle
        });
    };

    const handleStartProgressConfirm = async () => {
        const { error } = await supabase
            .from('goals')
            .update({ status: 'in_progress' })
            .eq('id', startProgressDialog.goalId);

        if (error) {
            console.error('Error updating goal status:', error);
            return;
        }

        // Update the goals list with the new status
        setGoals(goals.map(goal =>
            goal.id === startProgressDialog.goalId
                ? { ...goal, status: 'in_progress' }
                : goal
        ));
        setStartProgressDialog({ isOpen: false, goalId: null, goalTitle: '' });
    };

    const handleStartProgressCancel = () => {
        setStartProgressDialog({ isOpen: false, goalId: null, goalTitle: '' });
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            return;
        }
        navigate('/');
    };

    return (
        <div className="goals-container">
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Goal"
                message={`Are you sure you want to delete "${deleteDialog.goalTitle}"? This action cannot be undone.`}
            />
            <ConfirmDialog
                isOpen={doneDialog.isOpen}
                onClose={handleDoneCancel}
                onConfirm={handleDoneConfirm}
                title="Complete Goal"
                message={`Are you sure you want to mark "${doneDialog.goalTitle}" as completed?`}
                type="done"
            />
            <ConfirmDialog
                isOpen={startProgressDialog.isOpen}
                onClose={handleStartProgressCancel}
                onConfirm={handleStartProgressConfirm}
                title="Start Progress"
                message={`Are you ready to start progress on "${startProgressDialog.goalTitle}"?`}
                type="progress"
            />

            <div className="goals-header">
                <div className="goals-header-left">
                    {userProfile && (
                        <h2 className="user-greeting">Hi, {userProfile.first_name} {userProfile.last_name}</h2>
                    )}
                    <h1>My Goals</h1>
                    <div className="goals-actions">
                        <button onClick={() => setShowSectionForm(true)}>Add Section</button>
                        <button onClick={() => setShowGoalForm(true)}>Add Goal</button>
                    </div>
                </div>
                <div className="user-menu-container">
                    <button
                        className="user-menu-button"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'User'}
                    </button>
                    {showUserMenu && (
                        <div className="user-menu">
                            <button onClick={() => navigate('/settings')}>Settings</button>
                            <button onClick={handleSignOut}>Sign Out</button>
                        </div>
                    )}
                </div>
            </div>

            {showGoalForm && (
                <form onSubmit={handleGoalSubmit} className="goal-form">
                    <h3>Create New Goal</h3>
                    <input
                        type="text"
                        placeholder="Goal Title"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                        required
                    />
                    <input
                        type="date"
                        value={newGoal.start_date}
                        onChange={(e) => setNewGoal({ ...newGoal, start_date: e.target.value })}
                        required
                    />

                    <div className="duration-type-selector">
                        <label>Set goal by:</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="duration_type"
                                    value="days"
                                    checked={newGoal.duration_type === 'days'}
                                    onChange={(e) => setNewGoal({
                                        ...newGoal,
                                        duration_type: e.target.value,
                                        target_date: '' // Clear target date when switching to days
                                    })}
                                />
                                Duration in days
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="duration_type"
                                    value="end_date"
                                    checked={newGoal.duration_type === 'end_date'}
                                    onChange={(e) => setNewGoal({
                                        ...newGoal,
                                        duration_type: e.target.value,
                                        expected_duration: '' // Clear duration when switching to end date
                                    })}
                                />
                                End date
                            </label>
                        </div>
                    </div>

                    {newGoal.duration_type === 'days' ? (
                        <div className="form-group">
                            <label htmlFor="expected_duration">Expected Duration (days)</label>
                            <input
                                id="expected_duration"
                                type="number"
                                placeholder="Expected Duration (days)"
                                value={newGoal.expected_duration}
                                onChange={(e) => setNewGoal({ ...newGoal, expected_duration: e.target.value })}
                                min="1"
                                required
                            />
                            {newGoal.expected_duration && (
                                <div className="end-date-info">
                                    End date: {new Date(new Date(newGoal.start_date).getTime() + parseInt(newGoal.expected_duration) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="form-group">
                            <label htmlFor="target_date">Target Date</label>
                            <input
                                id="target_date"
                                type="date"
                                placeholder="Target Date"
                                value={newGoal.target_date}
                                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                                min={newGoal.start_date}
                                required
                            />
                            {newGoal.target_date && (
                                <div className="duration-info">
                                    Duration: {Math.ceil(Math.abs(new Date(newGoal.target_date) - new Date(newGoal.start_date)) / (1000 * 60 * 60 * 24))} days
                                </div>
                            )}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            value={newGoal.priority}
                            onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>

                    <select
                        value={newGoal.section_id || ''}
                        onChange={(e) => setNewGoal({ ...newGoal, section_id: e.target.value || null })}
                    >
                        <option value="">No Section</option>
                        {sections.map(section => (
                            <option key={section.id} value={section.id}>{section.title}</option>
                        ))}
                    </select>
                    <div className="form-actions">
                        <button type="submit">Create Goal</button>
                        <button type="button" onClick={() => setShowGoalForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            {showSectionForm && (
                <form onSubmit={handleSectionSubmit} className="section-form">
                    <h3>Create New Section</h3>
                    <input
                        type="text"
                        placeholder="Section Title"
                        value={newSection.title}
                        onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={newSection.description}
                        onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                        required
                    />
                    <div className="form-actions">
                        <button type="submit">Create Section</button>
                        <button type="button" onClick={() => setShowSectionForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            <div className="sections-list">
                {sections.map(section => (
                    <div key={section.id} className="section">
                        <h3>{section.title}</h3>
                        <p>{section.description}</p>
                        <div className="section-goals">
                            {goals
                                .filter(goal => goal.section_id === section.id)
                                .map(goal => (
                                    <Link to={`/goals/${goal.id}`} key={goal.id} className="goal-card">
                                        <button
                                            className="delete-button"
                                            onClick={(e) => handleDeleteClick(e, goal.id, goal.title)}
                                        >
                                            Delete
                                        </button>
                                        {goal.status === 'not_started' && (
                                            <button
                                                className="progress-button"
                                                onClick={(e) => handleStartProgressClick(e, goal.id, goal.title)}
                                            >
                                                Start Progress
                                            </button>
                                        )}
                                        {goal.status === 'in_progress' && (
                                            <button
                                                className="done-button"
                                                onClick={(e) => handleDoneClick(e, goal.id, goal.title)}
                                            >
                                                Done
                                            </button>
                                        )}
                                        <h4>{goal.title}</h4>
                                        <p>{goal.description}</p>
                                        <div className="goal-meta">
                                            <span className={`status-badge ${goal.status}`}>Status: {formatStatus(goal.status)}</span>
                                            <span className={`priority-badge ${goal.priority}`}>Priority: {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}</span>
                                            <span className="duration-badge">Duration: {goal.expected_duration} days</span>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="goals-list">
                {goals
                    .filter(goal => !goal.section_id)
                    .map(goal => (
                        <Link to={`/goals/${goal.id}`} key={goal.id} className="goal-card">
                            <button
                                className="delete-button"
                                onClick={(e) => handleDeleteClick(e, goal.id, goal.title)}
                            >
                                Delete
                            </button>
                            {goal.status === 'not_started' && (
                                <button
                                    className="progress-button"
                                    onClick={(e) => handleStartProgressClick(e, goal.id, goal.title)}
                                >
                                    Start Progress
                                </button>
                            )}
                            {goal.status === 'in_progress' && (
                                <button
                                    className="done-button"
                                    onClick={(e) => handleDoneClick(e, goal.id, goal.title)}
                                >
                                    Done
                                </button>
                            )}
                            <h4>{goal.title}</h4>
                            <p>{goal.description}</p>
                            <div className="goal-meta">
                                <span className={`status-badge ${goal.status}`}>Status: {formatStatus(goal.status)}</span>
                                <span className={`priority-badge ${goal.priority}`}>Priority: {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}</span>
                                <span className="duration-badge">Duration: {goal.expected_duration} days</span>
                            </div>
                        </Link>
                    ))}
            </div>
        </div>
    );
}

export default Goals; 