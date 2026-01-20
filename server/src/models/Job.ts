import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    company: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
    salary: string;
    salaryMin?: number;
    salaryMax?: number;
    description: string;
    requirements: string[];
    responsibilities?: string[];
    benefits?: string[];
    category: string;
    experience?: string;
    postedBy: mongoose.Types.ObjectId;
    isActive: boolean;
    applicationDeadline?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
    {
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true
        },
        type: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
            required: [true, 'Job type is required']
        },
        salary: {
            type: String,
            required: [true, 'Salary range is required']
        },
        salaryMin: {
            type: Number
        },
        salaryMax: {
            type: Number
        },
        description: {
            type: String,
            required: [true, 'Job description is required'],
            maxlength: [5000, 'Description cannot exceed 5000 characters']
        },
        requirements: [{
            type: String,
            trim: true
        }],
        responsibilities: [{
            type: String,
            trim: true
        }],
        benefits: [{
            type: String,
            trim: true
        }],
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true
        },
        experience: {
            type: String,
            trim: true
        },
        postedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        applicationDeadline: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Index for search functionality
jobSchema.index({ title: 'text', company: 'text', description: 'text', category: 'text' });
jobSchema.index({ category: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ isActive: 1 });

const Job = mongoose.model<IJob>('Job', jobSchema);

export default Job;
