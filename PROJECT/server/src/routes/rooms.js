import { sql } from "../config/database.js";
import { auth, adminAuth } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";
import express from "express";
import cors from "cors";

const router = express.Router();
router.use(cors());

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const result = await sql.query`
      SELECT r.*, 
        (SELECT AVG(CAST(rating as FLOAT)) FROM Reviews WHERE roomId = r.id) as averageRating,
        (SELECT COUNT(*) FROM Reviews WHERE roomId = r.id) as reviewCount
      FROM Rooms r
      ORDER BY r.createdAt DESC
    `;
    res.json(result.recordset);
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// Get single room with reviews
router.get("/:id", async (req, res) => {
  try {
    const roomId = parseInt(req.params.id, 10);
    if (isNaN(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const result = await sql.query`
      SELECT r.*, 
        (SELECT AVG(CAST(rating as FLOAT)) FROM Reviews WHERE roomId = r.id) as averageRating,
        (SELECT COUNT(*) FROM Reviews WHERE roomId = r.id) as reviewCount
      FROM Rooms r
      WHERE r.id = ${roomId}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Get reviews for the room with user information
    const reviews = await sql.query`
      SELECT r.*, 
        u.firstName, 
        u.lastName,
        u.id as userId
      FROM Reviews r
      JOIN Users u ON r.userId = u.id
      WHERE r.roomId = ${roomId}
      ORDER BY r.createdAt DESC
    `;

    // Extract room data
    let roomData = { ...result.recordset[0] };

    // Parse images field: assume comma separated string or single URL string
    if (roomData.images && typeof roomData.images === "string") {
      if (roomData.images.includes(",")) {
        roomData.images = roomData.images.split(",").map((img) => img.trim());
      } else {
        roomData.images = [roomData.images.trim()];
      }
    } else {
      roomData.images = [];
    }

    // Parse amenities field: assume comma separated string
    if (roomData.amenities && typeof roomData.amenities === "string") {
      roomData.amenities = roomData.amenities.split(",").map((a) => a.trim());
    } else {
      roomData.amenities = [];
    }

    res.json({
      ...roomData,
      reviews: reviews.recordset,
    });
  } catch (error) {
    console.error("Get room details error:", error);
    res.status(500).json({ message: "Error fetching room details" });
  }
});

// Create room (admin only)
router.post(
  "/",
  adminAuth,
  [
    body("name").notEmpty().withMessage("Room name is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("roomType").notEmpty().withMessage("Room type is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        description,
        price,
        capacity,
        roomType,
        amenities,
        images,
      } = req.body;

      // Save amenities and images as comma separated strings
      const amenitiesString = Array.isArray(amenities)
        ? amenities.join(",")
        : amenities || "";
      const imagesString = Array.isArray(images)
        ? images.join(",")
        : images || "";

      const result = await sql.query`
      INSERT INTO Rooms (name, description, price, capacity, roomType, amenities, images)
      OUTPUT INSERTED.*
      VALUES (${name}, ${description}, ${price}, ${capacity}, ${roomType}, ${amenitiesString}, ${imagesString})
    `;

      res.status(201).json(result.recordset[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update room (admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      capacity,
      roomType,
      amenities,
      images,
      isAvailable,
    } = req.body;

    // Convert amenities and images arrays to comma separated strings
    const amenitiesString = Array.isArray(amenities)
      ? amenities.join(",")
      : amenities || "";
    const imagesString = Array.isArray(images)
      ? images.join(",")
      : images || "";

    const result = await sql.query`
      UPDATE Rooms
      SET 
        name = ${name},
        description = ${description},
        price = ${price},
        capacity = ${capacity},
        roomType = ${roomType},
        amenities = ${amenitiesString},
        images = ${imagesString},
        isAvailable = ${isAvailable},
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = ${req.params.id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete room (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const result = await sql.query`
      DELETE FROM Rooms
      OUTPUT DELETED.*
      WHERE id = ${req.params.id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add review to room
router.post(
  "/:id/reviews",
  auth,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Comment must be between 10 and 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { rating, comment } = req.body;
      const roomId = req.params.id;
      const userId = req.user.id;

      // Check if user has already reviewed this room
      const existingReview = await sql.query`
      SELECT id FROM Reviews 
      WHERE userId = ${userId} AND roomId = ${roomId}
    `;

      if (existingReview.recordset.length > 0) {
        return res
          .status(400)
          .json({ message: "You have already reviewed this room" });
      }

      // Check if user has stayed in this room
      const hasBooked = await sql.query`
      SELECT id FROM Bookings 
      WHERE userId = ${userId} 
      AND roomId = ${roomId} 
      AND status = 'confirmed' 
      AND checkOutDate < GETDATE()
    `;

      if (hasBooked.recordset.length === 0) {
        return res.status(403).json({
          message: "You must have stayed in this room to leave a review",
        });
      }

      // Add the review
      const result = await sql.query`
      INSERT INTO Reviews (userId, roomId, rating, comment)
      OUTPUT INSERTED.*, 
        (SELECT firstName FROM Users WHERE id = ${userId}) as firstName,
        (SELECT lastName FROM Users WHERE id = ${userId}) as lastName
      VALUES (${userId}, ${roomId}, ${rating}, ${comment})
    `;

      res.status(201).json(result.recordset[0]);
    } catch (error) {
      console.error("Add review error:", error);
      res.status(500).json({ message: "Error adding review" });
    }
  }
);

// Update review
router.put(
  "/:roomId/reviews/:reviewId",
  auth,
  [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Comment must be between 10 and 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { rating, comment } = req.body;
      const { roomId, reviewId } = req.params;
      const userId = req.user.id;

      // Check if review exists and belongs to user
      const review = await sql.query`
      SELECT * FROM Reviews 
      WHERE id = ${reviewId} 
      AND roomId = ${roomId} 
      AND userId = ${userId}
    `;

      if (review.recordset.length === 0) {
        return res
          .status(404)
          .json({ message: "Review not found or unauthorized" });
      }

      // Update the review
      const result = await sql.query`
      UPDATE Reviews
      SET 
        rating = ${rating || review.recordset[0].rating},
        comment = ${comment || review.recordset[0].comment},
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = ${reviewId}
    `;

      res.json(result.recordset[0]);
    } catch (error) {
      console.error("Update review error:", error);
      res.status(500).json({ message: "Error updating review" });
    }
  }
);

// Delete review
router.delete("/:roomId/reviews/:reviewId", auth, async (req, res) => {
  try {
    const { roomId, reviewId } = req.params;
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const review = await sql.query`
      SELECT * FROM Reviews 
      WHERE id = ${reviewId} 
      AND roomId = ${roomId} 
      AND userId = ${userId}
    `;

    if (review.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "Review not found or unauthorized" });
    }

    // Delete the review
    await sql.query`
      DELETE FROM Reviews WHERE id = ${reviewId}
    `;

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Error deleting review" });
  }
});

export default router;
