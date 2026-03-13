-- Add voice and SMS config fields to business_config
alter table public.business_config
  add column if not exists vapi_assistant_id text,
  add column if not exists vapi_phone_number_id text,
  add column if not exists twilio_phone_number text,
  add column if not exists sms_enabled boolean default false,
  add column if not exists voice_enabled boolean default false,
  add column if not exists owner_notification_phone text,
  add column if not exists approval_timeout_minutes integer default 30;
