import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
    _id: mongoose.Types.ObjectId;
    job: mongoose.Types.ObjectId;
    applicant: mongoose.Types.ObjectId;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
    coverLetter: string;
    resume?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
    {
        job: {
            type: Schema.Types.ObjectId,
            ref: 'Job',
            required: [true, 'Job reference is required']
        },
        applicant: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Applicant reference is required']
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
            default: 'pending'
        },
        coverLetter: {
            type: String,
            required: [true, 'Cover letter is required'],
            maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
        },
        resume: {
            type: String
        },
        notes: {
            type: String,
            maxlength: [1000, 'Notes cannot exceed 1000 characters']
        }
    },
    {
        timestamps: true
    }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ status: 1 });

const Application = mongoose.model<IApplication>('Application', applicationSchema);

export default Application;
