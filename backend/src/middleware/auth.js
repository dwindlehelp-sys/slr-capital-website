import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // THIS IS THE FIX: Attach the admin's info to the request object
      // We find the user by the ID that was stored in the token
      req.admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true } // Don't select the password
      });

      next(); // Proceed to the next function (the route handler)
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};