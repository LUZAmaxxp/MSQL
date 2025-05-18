import express from 'express';
import { sql } from '../config/database.js';
import { auth, adminAuth } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const result = await sql.query`
      SELECT * FROM Rooms
      ORDER BY createdAt DESC
    `;
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single room
router.get('/:id', async (req, res) => {
  try {
    const result = await sql.query`
      SELECT r.*, 
        (SELECT AVG(CAST(rating as FLOAT)) FROM Reviews WHERE roomId = r.id) as averageRating,
        (SELECT COUNT(*) FROM Reviews WHERE roomId = r.id) as reviewCount
      FROM Rooms r
      WHERE r.id = ${req.params.id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Get reviews for the room
    const reviews = await sql.query`
      SELECT r.*, u.firstName, u.lastName
      FROM Reviews r
      JOIN Users u ON r.userId = u.id
      WHERE r.roomId = ${req.params.id}
      ORDER BY r.createdAt DESC
    `;

    res.json({
      ...result.recordset[0],
      reviews: reviews.recordset
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create room (admin only)
router.post('/', adminAuth, [
  body('name').notEmpty().withMessage('Room name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('roomType').notEmpty().withMessage('Room type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, capacity, roomType, amenities, images } = req.body;

    const result = await sql.query`
      INSERT INTO Rooms (name, description, price, capacity, roomType, amenities, images)
      OUTPUT INSERTED.*
      VALUES (${name}, ${description}, ${price}, ${capacity}, ${roomType}, ${amenities}, ${images})
    `;

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update room (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, price, capacity, roomType, amenities, images, isAvailable } = req.body;

    const result = await sql.query`
      UPDATE Rooms
      SET 
        name = ${name},
        description = ${description},
        price = ${price},
        capacity = ${capacity},
        roomType = ${roomType},
        amenities = ${amenities},
        images = ${images},
        isAvailable = ${isAvailable},
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = ${req.params.id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete room (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const result = await sql.query`
      DELETE FROM Rooms
      OUTPUT DELETED.*
      WHERE id = ${req.params.id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review to room
router.post('/:id/reviews', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const roomId = req.params.id;
    const userId = req.user.id;

    const result = await sql.query`
      INSERT INTO Reviews (userId, roomId, rating, comment)
      OUTPUT INSERTED.*
      VALUES (${userId}, ${roomId}, ${rating}, ${comment})
    `;

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 