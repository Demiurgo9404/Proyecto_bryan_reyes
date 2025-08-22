-- Check table structure
\d users

-- Check user data and status
SELECT id, username, email, status, email_verified, created_at, updated_at 
FROM users 
WHERE email IN (
    'super@loverose.com',
    'admin@loverose.com',
    'agency@loverose.com',
    'model@loverose.com',
    'user@loverose.com'
);

-- Check authentication requirements
SELECT name, setting FROM pg_settings 
WHERE name IN ('password_encryption', 'authentication_timeout', 'password_encryption');
