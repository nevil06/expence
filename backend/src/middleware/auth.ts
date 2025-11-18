import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getFirestore } from '../utils/firebase';

interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    
    // Verify that user exists in Firestore
    const userDoc = await getFirestore().collection('users').doc(req.userId).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};