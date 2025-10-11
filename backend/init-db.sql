DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = 'vikram'
   ) THEN
      CREATE ROLE vikram LOGIN PASSWORD '3224';
   END IF;
END
$do$;

CREATE DATABASE credit_system_db
    WITH OWNER = vikram
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;
