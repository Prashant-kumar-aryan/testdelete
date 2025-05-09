import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import upload from "../config/upload";
import bcrypt from "bcrypt";
import { z } from "zod";
import cloudinary from "../config/cloudinaryConfig";
import { registerSchema } from "../services/register.service";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.params.userid;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: "failed", message: "User not found" });
      return;
    }

    res.status(200).json({ success: "true", user });
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500).json({ success: "failed", message: "Server Error" });
  }
};

export const passwordUpdate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userid;
    if (!userId || typeof userId !== "string") {
      res.status(400).json({ message: "Invalid or missing user ID" });
      return;
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "New password and confirm password do not match" });
      return;
    }

    try {
      registerSchema.shape.password.parse(newPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
        return;
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: "true", message: "Password updated successfully" });
  } catch (error: any) {
    if (error.name === "CastError") {
      res.status(400).json({ message: "Invalid ID format", error: error.message });
    } else {
      res.status(500).json({ message: "Server Error" });
    }
  }
};



function isValidBase64Image(data: string): boolean {
  const regex = /^data:image\/(png|jpg|jpeg|gif|svg\+xml);base64,/;
  return regex.test(data);
}

function isValidBase64PDF(data: string): boolean {
  return data.startsWith("data:application/pdf;base64,");
}

function cleanBase64Data(data: string): string {
  if (isValidBase64Image(data) || isValidBase64PDF(data)) return data;

  if (data.startsWith("data:image/svg+xml,")) {
    return "data:image/svg+xml;base64," +
      Buffer.from(decodeURIComponent(data.slice(19))).toString("base64");
  }

  if (data.startsWith("data:application/pdf,")) {
    return "data:application/pdf;base64," +
      Buffer.from(decodeURIComponent(data.slice(21))).toString("base64");
  }

  if (data.startsWith("data:application/octet-stream;base64,")) {
    return data;
  }

  if (/^[A-Za-z0-9+/=]+$/.test(data)) {
    const pdfHeader = "JVBERi0";
    if (data.startsWith(pdfHeader)) return "data:application/pdf;base64," + data;
    return "data:image/png;base64," + data;
  }
  throw new Error("Invalid data format");
}


export const updateUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Called")
    const userId = req.params.userid;
    const updatedData = req.body;
    let failedUploads: any[] = [];

    if (updatedData.base64encodedImage) {
      try {
        const cleanedImageData = cleanBase64Data(updatedData.base64encodedImage);
        const result = await cloudinary.uploader.upload(cleanedImageData, {
          resource_type: "auto"
        });
        updatedData.imageUrl = result.secure_url;
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        res.status(400).json({ message: "Error uploading image", error });
        return;
      }
    }

    if (updatedData.base64encodedFiles && updatedData.fileNames) {
      const certificatePromises = updatedData.base64encodedFiles.map(async (base64File: string, index: number) => {
        try {
          const cleanedFileData = cleanBase64Data(base64File);
          const base64Data = cleanedFileData.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');

          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                resource_type: "auto",
                public_id: `certificate_${Date.now()}_${index}`,
                format: 'pdf',
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(buffer);
          });

          const uploadResult = result as { secure_url: string };
          return { name: updatedData.fileNames[index], url: uploadResult.secure_url };
        } catch (error) {
          return { name: updatedData.fileNames[index], error };
        }
      });

      const certificateResults = await Promise.all(certificatePromises);
      const successfulUploads = certificateResults.filter(cert => !cert.error);
      failedUploads = certificateResults.filter(cert => cert.error);

      const user = await User.findById(userId);
      if (user) {
        updatedData.certificates = [...(user.certificates || []), ...successfulUploads];
      }
    }

    delete updatedData.base64encodedImage;
    delete updatedData.base64encodedFiles;
    delete updatedData.fileNames;

    const updateObject: any = {};

    if (updatedData.specialization) {
      updateObject.$set = { specialization: updatedData.specialization };
      delete updatedData.specialization;
    }

    for (const [key, value] of Object.entries(updatedData)) {
      if (value !== undefined && value !== null) {
        if (!updateObject.$set) updateObject.$set = {};
        updateObject.$set[key] = value;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateObject,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      user: updatedUser,
      failedUploads: failedUploads.length > 0 ? failedUploads : undefined
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
