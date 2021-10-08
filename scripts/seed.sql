-- clear auth.users
TRUNCATE TABLE auth.users CASCADE;


-- add a user
INSERT INTO auth.users
  (
    instance_id,
    id,
    aud,
    "role",
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    is_super_admin,
    raw_app_meta_data,
    raw_user_meta_data,
    recovery_token,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'hello@example.com',
    extensions.crypt('x6YkY76!', extensions.gen_salt('bf')),
    now(),
    '',
    '',
    '',
    false,
    '{"provider": ["email"]}'::jsonb,
    '{}'::jsonb,
    '',
    now(),
    now()
  )
