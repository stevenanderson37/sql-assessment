-- It may be helpful to drop and reinstantilize the table when doing
-- the tests in case you delete users/cars the tests are expecting to see
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  email VARCHAR(100) UNIQUE
);

INSERT INTO Users
(firstname, lastname, email)
VALUES
  ( 'John', 'Smith', 'John@Smith.com'),
  ( 'Dave', 'Davis', 'Dave@Davis.com'),
  ( 'Jane', 'Janis', 'Jane@Janis.com');
