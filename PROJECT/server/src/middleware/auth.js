import jwt from "jsonwebtoken";
import { sql } from "../config/database.js";

const JWT_SECRETS = ["Z@45G3", "H@12SD"]; // Both JWT secrets used in the app

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Try all possible JWT secrets
    let decoded = null;
    for (const secret of JWT_SECRETS) {
      try {
        decoded = jwt.verify(token, secret);
        if (decoded) break;
      } catch (error) {
        continue;
      }
    }

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const result = await sql.query`
      SELECT id, email, firstName, lastName, role 
      FROM Users 
      WHERE id = ${decoded.userId}
    `;

    if (result.recordset.length === 0) {
      throw new Error("User not found");
    }

    req.user = result.recordset[0];
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Please authenticate" });
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    });
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(401).json({ message: "Please authenticate as admin" });
  }
};
