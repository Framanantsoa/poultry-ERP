# Poultry Farming Management System

## Overview
A streamlined, full-stack enterprise resource planning (ERP) system designed to monitor core poultry farm operations, including flock management, daily production tracking, and operational analytics.

---

## Features

### 🐓 Batch Management
- Create and manage poultry batches
- Assign breeds and track initial vs. current bird counts
- Track batch status (active/completed)

### 📊 Production & Inventory Tracking
- **Egg Production**: Record daily egg collection and view production logs
- **Feed Management**: Record feed consumption per batch
- **Mortality Tracking**: Log daily bird deaths with automatic stock adjustments

### 📈 Operations Dashboard
- Real-time overview of active flocks, total birds, and production metrics

---

## Tech Stack
- **Full-Stack Framework**: SvelteKit 3 (Svelte 5 / Tailwind CSS / Server API Routes)
- **Database**: PostgreSQL
- **Runtime**: Node.js 22+

---

## Local Setup — Step by Step

### 1. Clone the repository
```sh
git clone https://github.com/Framanantsoa/poultry-ERP poultry-erp
cd poultry-erp/web-app
```

### 2. Install dependencies
```sh
npm install
```

### 3. Create & Edit the .env file
```code
# Drizzle
DATABASE_URL="postgres://user:password@host:port/db-name"
```

### 4. Run database migrations
```sh
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 5. Run SQL instructions (PgSQL)
```sh
CREATE OR REPLACE FUNCTION refresh_batch_current_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    target_batch_id integer;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_batch_id := OLD.batch_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.batch_id <> NEW.batch_id) THEN
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

DROP TRIGGER IF EXISTS trg_mortalities_sync_batch_count ON mortalities;

CREATE TRIGGER trg_mortalities_sync_batch_count
AFTER INSERT OR UPDATE OR DELETE ON mortalities
FOR EACH ROW
EXECUTE FUNCTION refresh_batch_current_count();
```

### 6. Start the dev server
```sh
npm run dev
```
