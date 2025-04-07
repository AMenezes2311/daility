import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../helper/supabaseClient';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/goals.css';

function GoalDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [goal, setGoal] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [streak, setStreak] = useState(null);
    const [newUpdate, setNewUpdate] = useState({
        content: ''
    });
    const [deleteDialog, setDeleteDialog] = useState({
        isOpen: false
    });
    const [doneDialog, setDoneDialog] = useState({
        isOpen: false
    });
    const [startProgressDialog, setStartProgressDialog] = useState({
        isOpen: false
    });
    const [editMode, setEditMode] = useState(false);
    const [editedGoal, setEditedGoal] = useState(null);

    useEffect(() => {
        fetchGoal();
        fetchUpdates();
        fetchStreak();
    }, [id]);

    const fetchGoal = async () => {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching goal:', error);
            return;
        }

        setGoal(data);
        setEditedGoal(data);
    };

    const fetchUpdates = async () => {
        const { data, error } = await supabase
            .from('goal_updates')
            .select('*')
            .eq('goal_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching updates:', error);
            return;
        }

        setUpdates(data || []);
    };

    const fetchStreak = async () => {
        const { data, error } = await supabase
            .from('streaks')
            .select('*')
            .eq('goal_id', id);

        if (error) {
            console.error('Error fetching streak:', error);
            return;
        }

        // If there are any streaks, use the first one
        setStreak(data && data.length > 0 ? data[0] : null);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('goal_updates')
            .insert([
                {
                    ...newUpdate,
                    goal_id: id,
                    user_id: user.id
                }
            ])
            .select();

        if (error) {
            console.error('Error creating update:', error);
            return;
        }

        setUpdates([data[0], ...updates]);
        setNewUpdate({
            content: ''
        });

        // Update streak
        await updateStreak();
    };

    const updateStreak = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];

        if (!streak) {
            // Create new streak
            const { data, error } = await supabase
                .from('streaks')
                .insert([
                    {
                        user_id: user.id,
                        goal_id: id,
                        current_streak: 1,
                        longest_streak: 1,
                        last_updated: today
                    }
                ])
                .select();

            if (error) {
                console.error('Error creating streak:', error);
                return;
            }

            setStreak(data[0]);
        } else {
            const lastUpdateDate = new Date(streak.last_updated);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastUpdateDate) / (1000 * 60 * 60 * 24));

            let newCurrentStreak = streak.current_streak;
            if (diffDays === 1) {
                newCurrentStreak += 1;
            } else if (diffDays > 1) {
                newCurrentStreak = 1;
            }

            const { data, error } = await supabase
                .from('streaks')
                .update({
                    current_streak: newCurrentStreak,
                    longest_streak: Math.max(newCurrentStreak, streak.longest_streak),
                    last_updated: today
                })
                .eq('id', streak.id)
                .select();

            if (error) {
                console.error('Error updating streak:', error);
                return;
            }

            setStreak(data[0]);
        }
    };

    const handleDeleteClick = () => {
        setDeleteDialog({
            isOpen: true
        });
    };

    const handleDeleteConfirm = async () => {
        const { error } = await supabase.rpc('delete_goal_with_dependencies', {
            p_goal_id: id
        });

        if (error) {
            console.error('Error deleting goal:', error);
            return;
        }

        navigate('/goals');
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ isOpen: false });
    };

    const handleBackClick = () => {
        navigate('/goals');
    };

    const handleDoneClick = () => {
        setDoneDialog({
            isOpen: true
        });
    };

    const handleDoneConfirm = async () => {
        const { error } = await supabase
            .from('goals')
            .update({ status: 'completed' })
            .eq('id', id);

        if (error) {
            console.error('Error updating goal status:', error);
            return;
        }

        // Update the local goal state
        setGoal({ ...goal, status: 'completed' });
        setDoneDialog({ isOpen: false });
    };

    const handleDoneCancel = () => {
        setDoneDialog({ isOpen: false });
    };

    const handleStartProgressClick = () => {
        setStartProgressDialog({
            isOpen: true
        });
    };

    const handleStartProgressConfirm = async () => {
        const { error } = await supabase
            .from('goals')
            .update({ status: 'in_progress' })
            .eq('id', id);

        if (error) {
            console.error('Error updating goal status:', error);
            return;
        }

        // Update the local goal state
        setGoal({ ...goal, status: 'in_progress' });
        setStartProgressDialog({ isOpen: false });
    };

    const handleStartProgressCancel = () => {
        setStartProgressDialog({ isOpen: false });
    };

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleSaveEdit = async () => {
        const { error } = await supabase
            .from('goals')
            .update({
                title: editedGoal.title,
                description: editedGoal.description,
                priority: editedGoal.priority,
                section_id: editedGoal.section_id
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating goal:', error);
            return;
        }

        setGoal(editedGoal);
        setEditMode(false);
    };

    const handleCancelEdit = () => {
        setEditedGoal(goal);
        setEditMode(false);
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

    if (!goal) {
        return <div>Loading...</div>;
    }

    return (
        <div className="goal-detail">
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Goal"
                message={`Are you sure you want to delete "${goal.title}"? This action cannot be undone.`}
            />
            <ConfirmDialog
                isOpen={doneDialog.isOpen}
                onClose={handleDoneCancel}
                onConfirm={handleDoneConfirm}
                title="Complete Goal"
                message={`Are you sure you want to mark "${goal.title}" as completed?`}
                type="done"
            />
            <ConfirmDialog
                isOpen={startProgressDialog.isOpen}
                onClose={handleStartProgressCancel}
                onConfirm={handleStartProgressConfirm}
                title="Start Progress"
                message={`Are you ready to start progress on "${goal.title}"?`}
                type="progress"
            />

            <div className="goal-header">
                <div className="goal-header-content">
                    <button onClick={handleBackClick} className="back-button">
                        ← Back to Goals
                    </button>
                    <div className="goal-title-section">
                        <div>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={editedGoal.title}
                                    onChange={(e) => setEditedGoal({ ...editedGoal, title: e.target.value })}
                                    className="edit-title-input"
                                />
                            ) : (
                                <h2>{goal.title}</h2>
                            )}
                        </div>
                        <div className="goal-actions">
                            {!editMode && goal.status === 'not_started' && (
                                <button onClick={handleStartProgressClick} className="progress-button">
                                    Start Progress
                                </button>
                            )}
                            {!editMode && goal.status === 'in_progress' && (
                                <button onClick={handleDoneClick} className="done-button">
                                    Mark as Done
                                </button>
                            )}
                            {!editMode && (
                                <button onClick={handleEditClick} className="edit-button">
                                    Edit Goal
                                </button>
                            )}
                            {editMode && (
                                <>
                                    <button onClick={handleSaveEdit} className="save-button">
                                        Save Changes
                                    </button>
                                    <button onClick={handleCancelEdit} className="cancel-button">
                                        Cancel
                                    </button>
                                </>
                            )}
                            <button onClick={handleDeleteClick} className="delete-button">
                                Delete Goal
                            </button>
                        </div>
                    </div>
                </div>
                <div className="goal-meta">
                    <span className={`status-badge ${goal.status}`}>Status: {formatStatus(goal.status)}</span>
                    <span className={`priority-badge ${goal.priority}`}>Priority: {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}</span>
                    <span className="duration-badge">Duration: {goal.expected_duration} days</span>
                </div>
                {streak && (
                    <div className="streak-info">
                        <h3>Streak Information</h3>
                        <p>Current Streak: {streak.current_streak} days</p>
                        <p>Longest Streak: {streak.longest_streak} days</p>
                    </div>
                )}
            </div>

            <div className="goal-description">
                <h3>Description</h3>
                {editMode ? (
                    <textarea
                        value={editedGoal.description}
                        onChange={(e) => setEditedGoal({ ...editedGoal, description: e.target.value })}
                        className="edit-description-input"
                    />
                ) : (
                    <p>{goal.description}</p>
                )}
            </div>

            <div className="goal-details">
                <div className="detail-item">
                    <h4>Start Date</h4>
                    <p>{new Date(goal.start_date).toLocaleDateString()}</p>
                </div>
                <div className="detail-item">
                    <h4>Target Date</h4>
                    <p>{new Date(goal.target_date).toLocaleDateString()}</p>
                </div>
                <div className="detail-item">
                    <h4>Days Remaining</h4>
                    <p>{Math.ceil(goal.expected_duration - (new Date() - new Date(goal.start_date)) / (1000 * 60 * 60 * 24))} days</p>
                </div>
            </div>

            <div className="goal-updates">
                <h3>Progress Updates</h3>
                <form onSubmit={handleUpdateSubmit} className="update-form">
                    <textarea
                        placeholder="What's your progress?"
                        value={newUpdate.content}
                        onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                        required
                    />
                    <button type="submit">Add Update</button>
                </form>

                <div className="updates-list">
                    {updates.map(update => (
                        <div key={update.id} className="update-card">
                            <p>{update.content}</p>
                            <div className="update-meta">
                                <span>Date: {new Date(update.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GoalDetail; 