import express, { Response } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import { protect, requireEmployer, requireJobSeeker, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Job Seeker only)
router.post('/', protect, requireJobSeeker, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { jobId, coverLetter, resume } = req.body;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }

        // Check if job is active
        if (!job.isActive) {
            res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
            return;
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: req.user?._id
        });

        if (existingApplication) {
            res.status(400).json({ success: false, message: 'You have already applied for this job' });
            return;
        }

        // Create application
        const application = await Application.create({
            job: jobId,
            applicant: req.user?._id,
            coverLetter,
            resume: resume || req.user?.resume
        });

        // Populate job details
        await application.populate('job', 'title company');

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });
    } catch (error: any) {
        console.error('Apply error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to submit application' });
    }
});

// @route   GET /api/applications/my-applications
// @desc    Get current user's applications (Job Seeker)
// @access  Private (Job Seeker only)
router.get('/my-applications', protect, requireJobSeeker, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const applications = await Application.find({ applicant: req.user?._id })
            .sort('-createdAt')
            .populate('job', 'title company location type salary category');

        res.json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a specific job (Employer)
// @access  Private (Employer only)
router.get('/job/:jobId', protect, requireEmployer, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Verify job belongs to employer
        const job = await Job.findById(req.params.jobId);

        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }

        if (job.postedBy.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to view these applications' });
            return;
        }

        const applications = await Application.find({ job: req.params.jobId })
            .sort('-createdAt')
            .populate('applicant', 'name email phone location skills resume bio');

        res.json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
});

// @route   GET /api/applications/employer/all
// @desc    Get all applications for employer's jobs
// @access  Private (Employer only)
router.get('/employer/all', protect, requireEmployer, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Get all jobs by this employer
        const jobs = await Job.find({ postedBy: req.user?._id }).select('_id');
        const jobIds = jobs.map(job => job._id);

        // Get all applications for these jobs
        const applications = await Application.find({ job: { $in: jobIds } })
            .sort('-createdAt')
            .populate('job', 'title company')
            .populate('applicant', 'name email phone location skills');

        res.json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Employer only)
router.put('/:id/status', protect, requireEmployer, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status, notes } = req.body;

        // Validate status
        const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status' });
            return;
        }

        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            res.status(404).json({ success: false, message: 'Application not found' });
            return;
        }

        // Verify the job belongs to the employer
        const job = await Job.findById(application.job);
        if (!job || job.postedBy.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to update this application' });
            return;
        }

        application.status = status;
        if (notes) {
            application.notes = notes;
        }
        await application.save();

        res.json({
            success: true,
            message: 'Application status updated',
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update application' });
    }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('job', 'title company location type salary description')
            .populate('applicant', 'name email phone location skills resume bio');

        if (!application) {
            res.status(404).json({ success: false, message: 'Application not found' });
            return;
        }

        // Check authorization
        const isApplicant = application.applicant._id.toString() === req.user?._id.toString();
        const job = await Job.findById(application.job);
        const isEmployer = job?.postedBy.toString() === req.user?._id.toString();

        if (!isApplicant && !isEmployer) {
            res.status(403).json({ success: false, message: 'Not authorized to view this application' });
            return;
        }

        res.json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch application' });
    }
});

// @route   DELETE /api/applications/:id
// @desc    Withdraw application (Job Seeker only)
// @access  Private (Job Seeker only)
router.delete('/:id', protect, requireJobSeeker, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            res.status(404).json({ success: false, message: 'Application not found' });
            return;
        }

        // Check ownership
        if (application.applicant.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to withdraw this application' });
            return;
        }

        // Only allow withdrawal if pending or reviewed
        if (!['pending', 'reviewed'].includes(application.status)) {
            res.status(400).json({ success: false, message: 'Cannot withdraw application at this stage' });
            return;
        }

        await Application.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Application withdrawn successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to withdraw application' });
    }
});

export default router;
