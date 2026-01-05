INSERT INTO users (email, password_hash, name, surname, role, verified) 
VALUES ('kullanici@ipekaksesuar.com', '$2a$12$th82.HbLwHQv6j6zDIRDH.51DMvo9zAr20ibIOySQUykmnLhxrizO', 'kullanici', 'new', 'user', true);

UPDATE users
SET password_hash = '$2a$12$yDKKdtaIa1OaM6zfFtsJRe/N6eY4shHiPcBpJ6hc7yyHil3T2d9EK'
where email = 'admin@ipekaksesuar.com'

DELETE FROM "users"
WHERE email = 'eymenbaglar@outlook.com';

DELETE FROM "users"
WHERE email = 'test@test.com';

DELETE FROM "users"
WHERE email = 'eymenbaglar@outlook.com';
