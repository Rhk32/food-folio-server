CREATE OR REPLACE FUNCTION promote_user_to_manager()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only run when the restaurant becomes approved
    IF NEW.approval_status = 'approved'
       AND OLD.approval_status IS DISTINCT FROM 'approved' THEN

        UPDATE users
        SET role = 'manager'
        WHERE id IN (
            SELECT user_id
            FROM restaurant_manager
            WHERE restaurant_id = NEW.id
        );

    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER restaurant_approval_manager_trigger
AFTER UPDATE OF approval_status
ON restaurants
FOR EACH ROW
EXECUTE FUNCTION promote_user_to_manager();