-- Create Users table
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Create Rooms table
CREATE TABLE Rooms (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    roomType VARCHAR(50) NOT NULL,
    amenities TEXT,
    images TEXT,
    isAvailable BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Create Bookings table
CREATE TABLE Bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT FOREIGN KEY REFERENCES Users(id),
    roomId INT FOREIGN KEY REFERENCES Rooms(id),
    checkIn DATE NOT NULL,
    checkOut DATE NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    specialRequests TEXT,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Create Reviews table
CREATE TABLE Reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT FOREIGN KEY REFERENCES Users(id),
    roomId INT FOREIGN KEY REFERENCES Rooms(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
); 