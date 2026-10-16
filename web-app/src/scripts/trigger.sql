-- ─── Function: recompute current_count from initial_count - total deaths ───
CREATE OR REPLACE FUNCTION refresh_batch_current_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    target_batch_id integer;
BEGIN
    -- Determine which batch(es) to refresh
    IF (TG_OP = 'DELETE') THEN
        target_batch_id := OLD.batch_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.batch_id <> NEW.batch_id) THEN
        -- Batch changed: refresh both old and new
        UPDATE batches
        SET current_count = GREATEST(
                0,
                initial_count - COALESCE((
                    SELECT SUM(deaths) FROM mortalities WHERE batch_id = OLD.batch_id
                ), 0)
            ),
            updated_at = now()
        WHERE id = OLD.batch_id;

        target_batch_id := NEW.batch_id;
    ELSE
        target_batch_id := NEW.batch_id;
    END IF;

    -- Refresh the (single) affected batch
    UPDATE batches
    SET current_count = GREATEST(
            0,
            initial_count - COALESCE((
                SELECT SUM(deaths) FROM mortalities WHERE batch_id = target_batch_id
            ), 0)
        ),
        updated_at = now()
    WHERE id = target_batch_id;

    RETURN NULL;  -- AFTER trigger, return value ignored
END;
$$;

-- ─── Trigger ───
DROP TRIGGER IF EXISTS trg_mortalities_sync_batch_count ON mortalities;

CREATE TRIGGER trg_mortalities_sync_batch_count
AFTER INSERT OR UPDATE OR DELETE ON mortalities
FOR EACH ROW
EXECUTE FUNCTION refresh_batch_current_count();
