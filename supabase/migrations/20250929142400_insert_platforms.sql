-- Migration: Insert default platforms
-- Description: Adds the default platforms used by the frontend
-- Author: System
-- Date: 2025-09-29

-- Insert default platforms that match frontend component
INSERT INTO platforms (id, name) VALUES 
  ('e7eefa5a-c1d6-4a4f-8081-5c0c92c07908', 'Frontend'),
  ('29f6ef63-1b0c-48a4-9dcc-b79dca990ea0', 'Backend'),
  ('7622d226-f615-4386-b533-20af741e2aea', 'iOS'),
  ('acd09060-0301-44e1-8d8d-1d8c7a3c0f40', 'Android')
ON CONFLICT (id) DO NOTHING;