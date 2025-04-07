-- Drop the existing function first
DROP FUNCTION IF EXISTS delete_goal_with_dependencies(UUID);

-- Create a function to delete a goal and all its related records
CREATE OR REPLACE FUNCTION delete_goal_with_dependencies(p_goal_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete all related records in a transaction
    DELETE FROM goal_updates WHERE goal_updates.goal_id = p_goal_id;
    DELETE FROM streaks WHERE streaks.goal_id = p_goal_id;
    DELETE FROM goals WHERE goals.id = p_goal_id;
END;
$$; 