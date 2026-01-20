import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
}

interface JwtPayload {
    id: string;
    role: string;
}

// Protect routes - require authentication
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        let token: string | undefined;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({ success: false, message: 'Not authorized, no token' });
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
    }
};

// Require employer role
export const requireEmployer = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'employer') {
        res.status(403).json({ success: false, message: 'Access denied. Employer role required.' });
        return;
    }
    next();
};

// Require job seeker role
export const requireJobSeeker = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'jobseeker') {
        res.status(403).json({ success: false, message: 'Access denied. Job seeker role required.' });
        return;
    }
    next();
};

// Generate JWT token
export const generateToken = (id: string, role: string): string => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};
