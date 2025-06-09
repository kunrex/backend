CREATE DATABASE backend

USE backend

CREATE TABLE Users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,

    pwdHash CHAR(60) NOT NULL,
    refreshHash CHAR(60),

    auth TINYINT UNSIGNED NOT NULL
);

CREATE TABLE Foods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(300) NOT NULL,

    veg BOOLEAN NOT NULL,
    cookTime TIME NOT NULL,
    price INT UNSIGNED NOT NULL
);

CREATE TABLE FoodTags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(50) UNIQUE NOT NULL,
    colour CHAR(6) NOT NULL
);

CREATE TABLE FoodTagRelations (
    foodId BIGINT NOT NULL,
    tagId BIGINT NOT NULL,

    FOREIGN KEY (foodId) REFERENCES Foods(id),
    FOREIGN KEY (tagId) REFERENCES FoodTags(id)
);

CREATE TABLE Orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    createdBy BIGINT NOT NULL,
    payedBy BIGINT,

    status ENUM ('ordered', 'processing', 'completed') NOT NULL,

    createdOn DATETIME NOT NULL,
    completedOn DATETIME,

    subtotal FLOAT,
    discount INT,
    tip INT,
    total FLOAT,

    payedOn DATETIME,

    FOREIGN KEY (createdBy) REFERENCES Users(id),
    FOREIGN KEY (payedBy) REFERENCES Users(id)
);

CREATE TABLE Suborders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    foodId BIGINT NOT NULL,
    orderId BIGINT NOT NULL,
    authorId BIGINT NOT NULL,

    quantity INT NOT NULL,

    instructions VARCHAR(300),

    status ENUM ('ordered', 'processing', 'completed') NOT NULL,

    FOREIGN KEY (foodId) REFERENCES Foods(id),
    FOREIGN KEY (orderId) REFERENCES Orders(id),
    FOREIGN KEY (authorId) REFERENCES Users(id)
);