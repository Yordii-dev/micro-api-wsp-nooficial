-- mysql-init/01-grant_privileges.sql
GRANT ALL PRIVILEGES ON *.* TO 'nestjs'@'%';
FLUSH PRIVILEGES;
