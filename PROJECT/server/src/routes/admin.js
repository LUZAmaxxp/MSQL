import express from 'express';
import { sql } from '../config/database.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
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
      recentBookings: recentBookings.recordset
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const result = await sql.query`
      SELECT id, email, firstName, lastName, role, createdAt
      FROM Users
      ORDER BY createdAt DESC
    `;
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (admin only)
router.patch('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const result = await sql.query`
      UPDATE Users
      SET role = ${role}, updatedAt = GETDATE()
      OUTPUT INSERTED.id, INSERTED.email, INSERTED.firstName, INSERTED.lastName, INSERTED.role
      WHERE id = ${req.params.id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking statistics
router.get('/bookings/stats', adminAuth, async (req, res) => {
  try {
    // Get bookings by status
    const statusStats = await sql.query`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(totalPrice) as totalRevenue
      FROM Bookings
      GROUP BY status
    `;

    // Get bookings by month
    const monthlyStats = await sql.query`
      SELECT 
        FORMAT(createdAt, 'yyyy-MM') as month,
        COUNT(*) as count,
        SUM(totalPrice) as revenue
      FROM Bookings
      WHERE status = 'confirmed'
      GROUP BY FORMAT(createdAt, 'yyyy-MM')
      ORDER BY month DESC
    `;

    res.json({
      byStatus: statusStats.recordset,
      byMonth: monthlyStats.recordset
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 