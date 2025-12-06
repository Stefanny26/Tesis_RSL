-- Add exclusion_reason column to references table
ALTER TABLE references ADD COLUMN exclusion_reason TEXT;

-- Add index for faster queries on excluded references
CREATE INDEX idx_references_excluded ON references(status) WHERE status = 'excluded';

-- Add comment to document the column
COMMENT ON COLUMN references.exclusion_reason IS 'Reason provided by the reviewer for excluding this reference during screening';
