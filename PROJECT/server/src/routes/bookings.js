import express from "express";
import { sql } from "../config/database.js";
import { auth, adminAuth } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Get all bookings (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const result = await sql.query`
      SELECT b.*, 
        u.firstName as userFirstName, 
        u.lastName as userLastName,
        r.name as roomName,
        r.roomType
      FROM Bookings b
      JOIN Users u ON b.userId = u.id
      JOIN Rooms r ON b.roomId = r.id
      ORDER BY b.createdAt DESC
    `;
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's bookings
router.get("/my-bookings", auth, async (req, res) => {
  try {
    const result = await sql.query`
      SELECT b.*, 
        r.name as roomName,
        r.roomType,
        r.images
      FROM Bookings b
      JOIN Rooms r ON b.roomId = r.id
      WHERE b.userId = ${req.user.id}
      ORDER BY b.createdAt DESC
    `;
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create booking
router.post(
  "/",
  auth,
  [
    body("roomId").isInt().withMessage("Room ID is required"),
    body("checkIn").isDate().withMessage("Valid check-in date is required"),
    body("checkOut").isDate().withMessage("Valid check-out date is required"),
    body("specialRequests").optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { roomId, checkIn, checkOut, specialRequests } = req.body;

      // Check if room exists and is available
      const roomResult = await sql.query`
      SELECT * FROM Rooms 
      WHERE id = ${roomId} AND isAvailable = 1
    `;

      if (roomResult.recordset.length === 0) {
        return res.status(400).json({ message: "Room is not available" });
      }

      // Check for overlapping bookings
      const overlappingBookings = await sql.query`
      SELECT * FROM Bookings
      WHERE roomId = ${roomId}
      AND status != 'cancelled'
      AND (
        (checkIn <= ${checkIn} AND checkOut > ${checkIn})
        OR (checkIn < ${checkOut} AND checkOut >= ${checkOut})
        OR (checkIn >= ${checkIn} AND checkOut <= ${checkOut})
      )
    `;

      if (overlappingBookings.recordset.length > 0) {
        return res
          .status(400)
          .json({ message: "Room is already booked for these dates" });
      }

      // Calculate total price
      const days = Math.ceil(
        (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = days * roomResult.recordset[0].price;

      // Create booking
      const result = await sql.query`
      INSERT INTO Bookings (userId, roomId, checkIn, checkOut, totalPrice, specialRequests)
      OUTPUT INSERTED.*
      VALUES (${req.user.id}, ${roomId}, ${checkIn}, ${checkOut}, ${totalPrice}, ${specialRequests})
    `;

      res.status(201).json(result.recordset[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update booking status (admin only)
router.patch(
  "/:id/status",
  adminAuth,
  [
    body("status")
      .isIn(["pending", "confirmed", "cancelled"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status } = req.body;

      const result = await sql.query`
      UPDATE Bookings
      SET status = ${status}, updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = ${req.params.id}
    `;

      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(result.recordset[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Cancel booking
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const result = await sql.query`
      UPDATE Bookings
      SET status = 'cancelled', updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = ${req.params.id} AND userId = ${req.user.id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
