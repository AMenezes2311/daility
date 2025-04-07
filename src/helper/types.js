/**
 * @typedef {Object} Goal
 * @property {string} id
 * @property {string} user_id
 * @property {string} [section_id]
 * @property {string} title
 * @property {string} description
 * @property {number} expected_duration - in days
 * @property {string} start_date
 * @property {string} target_date
 * @property {'not_started' | 'in_progress' | 'completed'} status
 * @property {'low' | 'medium' | 'high'} priority
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Section
 * @property {string} id
 * @property {string} user_id
 * @property {string} title
 * @property {string} description
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} GoalUpdate
 * @property {string} id
 * @property {string} goal_id
 * @property {string} user_id
 * @property {string} content
 * @property {number} progress_percentage
 * @property {string} created_at
 */

/**
 * @typedef {Object} Streak
 * @property {string} id
 * @property {string} user_id
 * @property {string} goal_id
 * @property {number} current_streak
 * @property {number} longest_streak
 * @property {string} last_updated
 */ 