-- Change mensaje_admin column type from DATETIME to TEXT
ALTER TABLE Apelaciones 
MODIFY COLUMN mensaje_admin TEXT NULL;

-- If you also want to set a default value (optional):
-- ALTER TABLE Apelaciones 
-- ALTER COLUMN mensaje_admin SET DEFAULT NULL;
