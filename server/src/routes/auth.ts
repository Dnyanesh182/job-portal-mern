import express, { Response } from 'express';
import User from '../models/User';
import { protect, generateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, company } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'User already exists with this email' });
            return;
        }

        // Validate role
        if (!['employer', 'jobseeker'].includes(role)) {
            res.status(400).json({ success: false, message: 'Invalid role. Must be employer or jobseeker' });
            return;
        }

        // Require company for employers
        if (role === 'employer' && !company) {
            res.status(400).json({ success: false, message: 'Company name is required for employers' });
            return;
        }

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role,
            company: role === 'employer' ? company : undefined
        });

        // Generate token
        const token = generateToken(user._id.toString(), user.role);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    company: user.company
                },
                token
            }
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Please provide email and password' });
            return;
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        // Generate token
        const token = generateToken(user._id.toString(), user.role);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    company: user.company,
                    phone: user.phone,
                    location: user.location,
                    bio: user.bio,
                    skills: user.skills
                },
                token
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?._id);

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                company: user.company,
                phone: user.phone,
                location: user.location,
                bio: user.bio,
                skills: user.skills,
                resume: user.resume,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const allowedUpdates = ['name', 'phone', 'location', 'bio', 'skills', 'company'];
        const updates: any = {};

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            updates,
            { new: true, runValidators: true }
        );

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                company: user.company,
                phone: user.phone,
                location: user.location,
                bio: user.bio,
                skills: user.skills
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
    }
});

export default router;
