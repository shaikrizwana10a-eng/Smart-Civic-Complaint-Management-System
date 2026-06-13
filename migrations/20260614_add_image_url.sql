-- Production fix applied on 2026-06-14
-- SCMS deployment issue on Render

ALTER TABLE complaints
ADD COLUMN image_url TEXT;