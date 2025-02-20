
# sql to create the database and tables and users with '%' access 
# db name - neodrive username neodrive grant access for neodrive password neodriveisgenius

# mysql -u root -p < init.sql
# mysql < init.sql 
CREATE DATABASE IF NOT EXISTS neodrive;

CREATE USER IF NOT EXISTS "neodrive"@"localhost" IDENTIFIED BY "password";
GRANT ALL PRIVILEGES ON neodrive.* TO 'neodrive'@'localhost';
CREATE USER IF NOT EXISTS "neodrive"@"%" IDENTIFIED BY "password";
GRANT ALL PRIVILEGES ON neodrive.* TO 'neodrive'@'%';
CREATE USER IF NOT EXISTS "admin"@"localhost" IDENTIFIED BY "password";
GRANT ALL PRIVILEGES ON neodrive.* TO 'admin'@'localhost';


use neodrive;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(63) NOT NULL,
    name VARCHAR(63)  NULL,
    username VARCHAR(31) NOT NULL,
    password VARCHAR(127) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shortend_link (
    id SERIAL PRIMARY KEY,
    original_url VARCHAR(255) NOT NULL,
    short_code VARCHAR(20) UNIQUE NOT NULL,  -- Unique short code
    access_count INT DEFAULT 0,             -- Number of times accessed
    created_by INT unsigned default null ,                         -- ID of the user who created it (FK)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of last update
    -- FOREIGN KEY (created_by) REFERENCES users(id) -- Assuming you have a Users table
);

CREATE TABLE IF NOT EXISTS files
(
    id       SERIAL
        primary key,
    file_name     varchar(127)                                not null,
    file_size     bigint unsigned default 0                   not null,
    file_sha      varchar(64)                                 not null,
    file_path varchar(255)                                not null,
    created_at timestamp       default current_timestamp() null,
    updated_at timestamp                                   null on update current_timestamp(),
    constraint file_sha
        unique (file_sha)
);
