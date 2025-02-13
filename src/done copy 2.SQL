CREATE TABLE track_table (
    table_name VARCHAR(255) PRIMARY KEY
);


DELIMITER $$

CREATE TRIGGER before_insert_name 
BEFORE INSERT ON your_table 
FOR EACH ROW
BEGIN
    DECLARE restriction_count INT;
    DECLARE current_pattern VARCHAR(255);

    SELECT COUNT(*) INTO restriction_count
    FROM name_restrictions
    WHERE is_active = TRUE;

    IF restriction_count > 0 THEN
        SELECT name_pattern INTO current_pattern
        FROM name_restrictions
        WHERE is_active = TRUE
        LIMIT 1; -- Assuming you want to enforce only the first active restriction

        IF NEW.name NOT REGEXP current_pattern THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE = 'Name does not comply with the defined restrictions.';
        END IF;
    END IF;
END$$

DELIMITER ;

CREATE TABLE IF NOT EXISTS `name_restrictions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name_pattern` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE
);