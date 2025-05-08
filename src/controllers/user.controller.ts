import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import upload from "../config/upload";
import bcrypt from 'bcrypt';
import cloudinary from "../config/cloudinaryConfig";
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userid;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userid;
    const updatedData= req.body;
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'certificate', maxCount: 5 } 
    ])(req, res, async (err:any) => {
      if (err) {
        console.error('Error uploading files:', err);
        res.status(400).json({ message: "Error uploading files",err});
        return;
      }

      // Function to upload file to Cloudinary
      const uploadToCloudinary = async (file: Express.Multer.File) => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        let dataURI = "data:" + file.mimetype + ";base64," + b64;
        const cldRes = await cloudinary.uploader.upload(dataURI, {
          resource_type: "auto",
        });
        return cldRes.secure_url;
      };

      // Handle image upload
      if (req.files && 'image' in req.files) {
        const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] })['image'][0];
        updatedData.imageUrl = await uploadToCloudinary(imageFile);
      }

      // Handle certificate uploads
      if (req.files && 'certificate' in req.files) {
        const certificateFiles = (req.files as { [fieldname: string]: Express.Multer.File[] })['certificate'];
        const certificatePromises = certificateFiles.map(async (file) => {
          const url = await uploadToCloudinary(file);
          return { name: file.originalname, url };
        });
        const newCertificates = await Promise.all(certificatePromises);
        
        // Merge new certificates with existing ones
        const user = await User.findById(userId);
        if (user) {
          updatedData.certificates = [...(user.certificates || []), ...newCertificates];
        }
      }
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updatedData },
        { new: true, runValidators: true }
      ).catch(error => {
        console.error('Error updating user:', error);
        return null;
      });

      if (!updatedUser) {
        res.status(404).json({ message: "User not found"});
        return;
      }

      res.status(200).json({ message: "User updated successfully", user: updatedUser });
    });
  }
  catch (error) {
    console.error('Error in updateUsers:', error);
    res.status(500).json({ message: "Server Error" });
  }
};
export const passwordUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userid;
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ message: "Invalid or missing user ID" });
      return;
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "New password and confirm password do not match" });
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error('Error updating password:', error);
    if (error) {
      console.error('CastError details:', error);
      res.status(400).json({ message: "Invalid ID format", error });
    } else {
      res.status(500).json({ message: "Server Error" });
    }
  }
};