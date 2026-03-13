ALTER TABLE tenants ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE business_config ADD COLUMN IF NOT EXISTS enabled_features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE business_config ALTER COLUMN timezone SET DEFAULT 'Australia/Sydney';
