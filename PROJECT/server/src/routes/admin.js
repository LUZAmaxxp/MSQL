import express from "express";
import { sql } from "../config/database.js";
import { adminAuth } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// All admin routes require admin authentication middleware
router.use(adminAuth);

// GET /api/admin/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    // Bookings stats
    const bookingsResult = await sql.query`
      SELECT 
        COUNT(*) as totalBookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingBookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmedBookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelledBookings,
        SUM(CASE WHEN status = 'confirmed' THEN totalPrice ELSE 0 END) as totalRevenue
      FROM Bookings
    `;
    const bookingsStats = bookingsResult.recordset[0];

    // Rooms stats
    const roomsResult = await sql.query`
      SELECT 
        COUNT(*) as totalRooms,
        COUNT(CASE WHEN isAvailable = 1 THEN 1 END) as availableRooms,
        COUNT(CASE WHEN isAvailable = 0 THEN 1 END) as occupiedRooms
      FROM Rooms
    `;
    const roomStats = roomsResult.recordset[0];

    // Users stats
    const usersResult = await sql.query`
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as adminUsers
      FROM Users
    `;
    const userStats = usersResult.recordset[0];

    // Calculate occupancy rate
    const occupancyRate =
      roomStats.totalRooms > 0
        ? Math.round((roomStats.occupiedRooms / roomStats.totalRooms) * 100)
        : 0;

    // Recent bookings with user and room info - Updated query to match frontend expectations
    const recentBookingsResult = await sql.query`
      SELECT TOP 10
        b.id, 
        b.checkIn, 
        b.checkOut, 
        b.status, 
        b.totalPrice,
        b.createdAt,
        u.id as userId,
        u.firstName, 
        u.lastName, 
        u.email,
        u.avatar,
        r.id as roomId,
        r.name as roomName, 
        r.roomType
      FROM Bookings b
      LEFT JOIN Users u ON b.userId = u.id
      LEFT JOIN Rooms r ON b.roomId = r.id
      WHERE b.id IS NOT NULL
      ORDER BY b.createdAt DESC
    `;

    // Transform recent bookings to match frontend interface
    const recentBookings = recentBookingsResult.recordset.map((booking) => {
      console.log("Raw booking data:", booking); // Debug log

      return {
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: (booking.checkOut),
        totalPrice: parseFloat(booking.totalPrice) || 0,
        status: booking.status || "pending",
        user: booking.userId
          ? {
              id: booking.userId,
              firstName: booking.firstName || "Unknown",
              lastName: booking.lastName || "User",
              email: booking.email || "",
              avatar: booking.avatar || null,
            }
          : {
              id: null,
              firstName: "Unknown",
              lastName: "User",
              email: "",
              avatar: null,
            },
        room: booking.roomId
          ? {
              id: booking.roomId,
              name: booking.roomName || "Unknown Room",
              roomType: booking.roomType || "Standard",
            }
          : {
              id: null,
              name: "Unknown Room",
              roomType: "Standard",
            },
      };
    });

    // Defensive fix: totalRevenue might be null if no confirmed bookings
    const totalRevenue = parseFloat(bookingsStats.totalRevenue) || 0;

    console.log("Dashboard stats:", {
      bookingsStats,
      roomStats,
      userStats,
      totalRevenue,
      recentBookingsCount: recentBookings.length,
    }); // Debug log

    // Return data in the format expected by frontend
    const dashboardData = {
      totalBookings: parseInt(bookingsStats.totalBookings) || 0,
      totalRooms: parseInt(roomStats.totalRooms) || 0,
      totalUsers: parseInt(userStats.totalUsers) || 0,
      totalRevenue: parseFloat(totalRevenue) || 0,
      occupancyRate: occupancyRate,
      pendingBookings: parseInt(bookingsStats.pendingBookings) || 0,
      recentBookings: recentBookings,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

// GET all users (admin only)
router.get("/users", async (req, res) => {
  try {
    const result = await sql.query`
      SELECT id, email, firstName, lastName, role, createdAt, avatar
      FROM Users
      ORDER BY createdAt DESC
    `;
    res.json(result.recordset);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// PATCH update user role (admin only)
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

      // Prevent self role change
      // Ensure type safe comparison (both as strings)
      if (userId === String(req.user.id)) {
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

// GET booking stats last 1 month (optional additional endpoint)
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
