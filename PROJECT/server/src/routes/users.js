import express from "express";
import bcrypt from "bcryptjs";
import { sql } from "../config/database.js";
import { auth } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const result = await sql.query`
      SELECT id, email, firstName, lastName, role, createdAt
      FROM Users
      WHERE id = ${req.user.id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put(
  "/profile",
  auth,
  [
    body("firstName")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("currentPassword")
      .optional()
      .notEmpty()
      .withMessage("Current password is required to change password"),
    body("newPassword")
      .optional()
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, email, currentPassword, newPassword } =
        req.body;
      let updateFields = {};
      let updateQuery = "UPDATE Users SET ";

      // Check if email is being changed and if it's already taken
      if (email && email !== req.user.email) {
        const existingUser = await sql.query`
        SELECT id FROM Users WHERE email = ${email}
      `;

        if (existingUser.recordset.length > 0) {
          return res.status(400).json({ message: "Email is already taken" });
        }
        updateFields.email = email;
      }

      // Handle password change
      if (currentPassword && newPassword) {
        const user = await sql.query`
        SELECT password FROM Users WHERE id = ${req.user.id}
      `;

        const isMatch = await bcrypt.compare(
          currentPassword,
          user.recordset[0].password
        );
        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        updateFields.password = hashedPassword;
      }

      // Add other fields to update
      if (firstName) updateFields.firstName = firstName;
      if (lastName) updateFields.lastName = lastName;

      // Build update query
      const updateEntries = Object.entries(updateFields);
      if (updateEntries.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      updateQuery += updateEntries
        .map(([key, value]) => `${key} = ${value}`)
        .join(", ");
      updateQuery +=
        ", updatedAt = GETDATE() OUTPUT INSERTED.id, INSERTED.email, INSERTED.firstName, INSERTED.lastName, INSERTED.role WHERE id = ${req.user.id}";

      const result = await sql.query(updateQuery);

      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(result.recordset[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get user's reviews
router.get("/reviews", auth, async (req, res) => {
  try {
    const result = await sql.query`
      SELECT r.*, rm.name as roomName, rm.roomType
      FROM Reviews r
      JOIN Rooms rm ON r.roomId = rm.id
      WHERE r.userId = ${req.user.id}
      ORDER BY r.createdAt DESC
    `;
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
