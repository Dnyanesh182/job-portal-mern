import express, { Response } from 'express';
import Job from '../models/Job';
import Application from '../models/Application';
import { protect, requireEmployer, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with search/filter
// @access  Public
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            search,
            category,
            type,
            location,
            page = 1,
            limit = 10,
            sort = '-createdAt'
        } = req.query;

        // Build query
        const query: any = { isActive: true };

        // Text search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Job type filter
        if (type) {
            query.type = type;
        }

        // Location filter
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Pagination
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const jobs = await Job.find(query)
            .sort(sort as string)
            .skip(skip)
            .limit(limitNum)
            .populate('postedBy', 'name company');

        const total = await Job.countDocuments(query);

        res.json({
            success: true,
            data: jobs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
    }
});

// @route   GET /api/jobs/categories
// @desc    Get all job categories
// @access  Public
router.get('/categories', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const categories = await Job.distinct('category', { isActive: true });
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
});

// @route   GET /api/jobs/employer/my-jobs
// @desc    Get jobs posted by current employer
// @access  Private (Employer only)
router.get('/employer/my-jobs', protect, requireEmployer, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const jobs = await Job.find({ postedBy: req.user?._id }).sort('-createdAt');

        // Get application counts for each job
        const jobsWithApplications = await Promise.all(
            jobs.map(async (job) => {
                const applicationCount = await Application.countDocuments({ job: job._id });
                return {
                    ...job.toObject(),
                    applicationCount
                };
            })
        );

        res.json({ success: true, data: jobsWithApplications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch your jobs' });
    }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name company email');

        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }

        res.json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch job' });
    }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private (Employer only)
router.post('/', protect, requireEmployer, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            title,
            location,
            type,
            salary,
            salaryMin,
            salaryMax,
            description,
            requirements,
            responsibilities,
            benefits,
            category,
            experience,
            applicationDeadline
        } = req.body;

        const job = await Job.create({
            title,
            company: req.user?.company || 'Unknown Company',
            location,
            type,
            salary,
            salaryMin,
            salaryMax,
            description,
            requirements: requirements || [],
            responsibilities: responsibilities || [],
            benefits: benefits || [],
            category,
            experience,
            applicationDeadline,
            postedBy: req.user?._id
        });

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            data: job
        });
    } catch (error: any) {
        console.error('Create job error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to create job' });
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (Employer only, own job)
router.put('/:id', protect, requireEmployer, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }

        // Check ownership
        if (job.postedBy.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to update this job' });
            return;
        }

        const allowedUpdates = [
            'title', 'location', 'type', 'salary', 'salaryMin', 'salaryMax',
            'description', 'requirements', 'responsibilities', 'benefits',
            'category', 'experience', 'isActive', 'applicationDeadline'
        ];

        const updates: any = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        job = await Job.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            message: 'Job updated successfully',
            data: job
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to update job' });
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (Employer only, own job)
router.delete('/:id', protect, requireEmployer, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }

        // Check ownership
        if (job.postedBy.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
            return;
        }

        // Delete associated applications
        await Application.deleteMany({ job: job._id });

        await Job.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete job' });
    }
});

export default router;
