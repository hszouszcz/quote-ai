-- Add man_days column to quotation_tasks table
ALTER TABLE quotation_tasks ADD COLUMN man_days NUMERIC;

-- Update the column to not null with a default value for existing records
UPDATE quotation_tasks SET man_days = 0 WHERE man_days IS NULL;

-- Make the column not null after updating existing records
ALTER TABLE quotation_tasks ALTER COLUMN man_days SET NOT NULL;