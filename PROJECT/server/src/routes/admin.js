import express from "express";
import { sql } from "../config/database.js";
import { adminAuth } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// Get dashboard statistics
router.get("/dashboard", async (req, res) => {
  try {
    // Get total bookings
    const bookingsResult = await sql.query`
      SELECT 
        COUNT(*) as totalBookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingBookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmedBookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelledBookings,
        SUM(CASE WHEN status = 'confirmed' THEN totalPrice ELSE 0 END) as totalRevenue
      FROM Bookings
    `;

    // Get total rooms
    const roomsResult = await sql.query`
      SELECT 
        COUNT(*) as totalRooms,
        COUNT(CASE WHEN isAvailable = 1 THEN 1 END) as availableRooms,
        COUNT(CASE WHEN isAvailable = 0 THEN 1 END) as occupiedRooms
      FROM Rooms
    `;

    // Get total users
    const usersResult = await sql.query`
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as adminUsers
      FROM Users
    `;

    // Get recent bookings
    const recentBookings = await sql.query`
      SELECT TOP 5
        b.*,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        r.name as roomName
      FROM Bookings b
      JOIN Users u ON b.userId = u.id
      JOIN Rooms r ON b.roomId = r.id
      ORDER BY b.createdAt DESC
    `;

    res.json({
      bookings: bookingsResult.recordset[0],
      rooms: roomsResult.recordset[0],
      users: usersResult.recordset[0],
      recentBookings: recentBookings.recordset,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

// Get all users (admin only)
router.get("/users", async (req, res) => {
  try {
    const result = await sql.query`
      SELECT id, email, firstName, lastName, role, createdAt
      FROM Users
      ORDER BY createdAt DESC
    `;
    res.json(result.recordset);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Update user role (admin only)
router.patch(
  "/users/:id/role",
  [body("role").isIn(["user", "admin"]).withMessage("Invalid role")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { role } = req.body;
      const userId = req.params.id;

      // Prevent self-role change
      if (parseInt(userId) === req.user.id) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }

      const result = await sql.query`
      UPDATE Users
      SET role = ${role}, updatedAt = GETDATE()
      OUTPUT INSERTED.id, INSERTED.email, INSERTED.firstName, INSERTED.lastName, INSERTED.role
      WHERE id = ${userId}
    `;

      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(result.recordset[0]);
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({ message: "Error updating user role" });
    }
  }
);

// Get booking statistics
router.get("/bookings/stats", async (req, res) => {
  try {
    const result = await sql.query`
      SELECT 
        COUNT(*) as totalBookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingBookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmedBookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelledBookings,
        SUM(CASE WHEN status = 'confirmed' THEN totalPrice ELSE 0 END) as totalRevenue,
        AVG(CASE WHEN status = 'confirmed' THEN totalPrice ELSE NULL END) as averageBookingValue
      FROM Bookings
      WHERE createdAt >= DATEADD(month, -1, GETDATE())
    `;

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Booking stats error:", error);
    res.status(500).json({ message: "Error fetching booking statistics" });
  }
});

export default router;