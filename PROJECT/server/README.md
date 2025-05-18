# Azure Haven Hotel Booking System - Backend

This is the backend server for the Azure Haven Hotel Booking System, built with Express.js and MSSQL.

## Prerequisites

- Node.js (v14 or higher)
- MSSQL Server
- npm or yarn

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=localhost
DB_NAME=azure_haven_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

3. Create the database and tables:
- Create a new database named `azure_haven_db` in MSSQL Server
- Run the SQL commands from `src/config/schema.sql` to create the necessary tables

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create new room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Delete room (admin only)
- `POST /api/rooms/:id/reviews` - Add review to room

### Bookings
- `GET /api/bookings` - Get all bookings (admin only)
- `GET /api/bookings/my-bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status (admin only)
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/reviews` - Get user's reviews

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/role` - Update user role
- `GET /api/admin/bookings/stats` - Get booking statistics

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

Error responses include a message and optional validation errors:
```json
{
  "message": "Error message",
  "errors": [
    {
      "msg": "Validation error message",
      "param": "field_name",
      "location": "body"
    }
  ]
}
``` 