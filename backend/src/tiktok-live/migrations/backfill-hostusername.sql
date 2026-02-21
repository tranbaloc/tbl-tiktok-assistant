-- Migration script to backfill hostUsername for existing data
-- Run this script after the columns have been created

-- Backfill hostUsername for live_chat_message
UPDATE live_chat_message 
SET "hostUsername" = (
  SELECT "hostUsername" 
  FROM live_session 
  WHERE live_session.id = live_chat_message."sessionId"
)
WHERE "hostUsername" IS NULL;

-- Backfill hostUsername for live_gift
UPDATE live_gift 
SET "hostUsername" = (
  SELECT "hostUsername" 
  FROM live_session 
  WHERE live_session.id = live_gift."sessionId"
)
WHERE "hostUsername" IS NULL;

-- Optional: After backfilling, you can set NOT NULL constraint
-- ALTER TABLE live_chat_message ALTER COLUMN "hostUsername" SET NOT NULL;
-- ALTER TABLE live_gift ALTER COLUMN "hostUsername" SET NOT NULL;
