
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

-- insert into users (email, name, username, password, is_verified) values ('', 'Admin', 'admin', 'password', 1);
CREATE TABLE IF NOT EXISTS shortend_link 
(
    id           bigint unsigned auto_increment
        primary key,
    original_url varchar(255)                          not null,
    short_code   varchar(20)                           not null,
    access_count int       default 0                   null,
    created_by   bigint unsigned                       null,
    created_at   timestamp default current_timestamp() null,
    updated_at   timestamp default current_timestamp() null on update current_timestamp(),
    constraint idx_short_code
        unique (short_code),
    constraint shortend_link_users_id_fk
        foreign key (created_by) references users (id)
);

CREATE TABLE IF NOT EXISTS files
(
    id         bigint unsigned auto_increment
        primary key,
    file_name  varchar(127)                                not null,
    file_size  bigint unsigned default 0                   not null,
    file_sha   varchar(64)                                 not null,
    file_path  varchar(255)                                not null,
    created_by bigint unsigned                             null,
    created_at timestamp       default current_timestamp() null,
    updated_at timestamp       default current_timestamp() null on update current_timestamp(),
    constraint idx_file_sha
        unique (file_sha),
    constraint files_users__fk
        foreign key (created_by) references users (id)
);

