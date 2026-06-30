ALTER TABLE jobs
ALTER COLUMN job_number TYPE integer
USING job_number::integer;