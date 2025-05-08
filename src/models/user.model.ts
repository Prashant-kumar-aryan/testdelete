import mongoose, { Document, Schema } from 'mongoose';

// Define the Certificate interface
interface Certificate {
  name: string;
  url: string;
}

export interface IUser extends Document {
  cognitoId: string; // Unique Cognito user ID (sub)
  role: 'CLIENT' | 'COACH' | 'ADMIN';
  firstName: string;
  lastName: string;
  email: string;
  preferableActivity?: string;
  target?: string;
  imageUrl?: string;
  
  // Rating fields
  averageRating?: number; // Average rating (calculated)
  totalRatings?: number;  // Count of ratings
  ratingSum?: number;     // Sum of all ratings
  
  // Coach fields
  title?: string;
  about?: string;
  specialization?: string[];
  certificates?: Certificate[]; // Changed from string[] to Certificate[]

  // Admin field
  phoneNumber?: string | null;
}

const userSchema = new Schema<IUser>(
  {
    cognitoId: {
      type: String,
      required: [true, 'Cognito user ID is required'],
      unique: true, 
    },
    role: {
      type: String,
      enum: ['CLIENT', 'COACH', 'ADMIN'],
      required: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name must be less than 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name must be less than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    preferableActivity: {
      type: String,
      enum: ['YOGA', 'PILATES', 'CARDIO', 'WEIGHTS', 'STRENGTH', 'FLEXIBILITY'],
      default: 'FLEXIBILITY',
      trim: true,
    },
    target: {
      type: String,
      enum: [
        'Lose Weight',
        'Gain Weight',
        'Improve flexibility',
        'General fitness',
        'Build Muscle',
        'Rehabilitation/Recovery',
      ],
      default: 'General fitness',
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    
    // Rating fields for efficient calculations
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingSum: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Coach-specific
    title: {
      type: String,
      trim: true,
      default: '',
    },
    about: {
      type: String,
      trim: true,
      default: '',
    },
    specialization: {
      type: [String],
      default: [],
    },
    certificates: {
      type: [{
        name: { type: String },
        url: { type: String }
      }],
      default: [],
    },

    // Admin-specific
    phoneNumber: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Update `updatedAt` timestamp on save
userSchema.pre<IUser>('save', function (next) {
  // this.updatedAt = new Date();
  next();
});

// Add index for role to quickly find coaches
userSchema.index({ role: 1 });

// Use the 'CoachDB' collection instead of the default 'users' collection
const User = mongoose.model<IUser>('User', userSchema);

export default User;