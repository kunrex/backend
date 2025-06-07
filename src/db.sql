CREATE DATABASE backend

USE backend

-- For tag in users, first bit is admin perms, second is chef perms and third is customer perms

CREATE TABLE Users (
    ID BIGINT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PwdHash CHAR(60) NOT NULL,
    Tag TINYINT UNSIGNED NOT NULL
);

CREATE TABLE Foods (
    ID BIGINT PRIMARY KEY,
    Name VARCHAR(100) UNIQUE NOT NULL,
    Description VARCHAR(300) NOT NULL,
    CookTime TIME NOT NULL,
    Veg BOOLEAN NOT NULL,
    Price INT UNSIGNED NOT NULL
);

CREATE TABLE FoodTags (
    ID BIGINT PRIMARY KEY,
    Name VARCHAR(50) UNIQUE NOT NULL,
    Colour CHAR(6) NOT NULL
);

CREATE TABLE FoodTagRels (
    FoodID BIGINT NOT NULL,
    TagTD BIGINT NOT NULL,

    FOREIGN KEY (FoodID) REFERENCES Foods(ID),
    FOREIGN KEY (TagTD) REFERENCES FoodTags(ID)
);

CREATE TABLE Orders (
    ID BIGINT PRIMARY KEY,

    CreatedBy BIGINT NOT NULL,
    PayedBy BIGINT,

    Status ENUM ('ordered', 'processing', 'completed') NOT NULL,

    CreatedOn DATETIME NOT NULL,
    CompletedOn DATETIME,

    Subtotal FLOAT(2),
    Discount INT,
    Tip INT,
    Total FLOAT(2),

    PayedOn DATETIME,

    FOREIGN KEY (CreatedBy) REFERENCES Users(ID),
    FOREIGN KEY (PayedBy) REFERENCES Users(ID)
);

CREATE TABLE Suborders (
    ID BIGINT PRIMARY KEY,

    FoodId BIGINT NOT NULL,
    OrderID BIGINT NOT NULL,
    AddedBy BIGINT NOT NULL,

    Quantity INT NOT NULL,

    Instructions VARCHAR(300),

    Status ENUM ('ordered', 'processing', 'completed') NOT NULL,

    FOREIGN KEY (FoodId) REFERENCES Foods(ID),
    FOREIGN KEY (OrderID) REFERENCES Orders(ID),
    FOREIGN KEY (AddedBy) REFERENCES Users(ID)
);