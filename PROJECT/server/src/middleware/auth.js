import jwt from 'jsonwebtoken';
import { sql } from '../config/database.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, "Z3r0@H4v3n");
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const result = await sql.query`
      SELECT id, email, firstName, lastName, role 
      FROM Users 
      WHERE id = ${decoded.userId}
    `;

    if (result.recordset.length === 0) {
      throw new Error();
    }

    req.user = result.recordset[0];
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate as admin' });
  }
}; 