import { Request, Response } from "express";
import User from '../models/user.model';

export const getCoaches= async(req: Request, res: Response):Promise<void> => {
  try {
    const coaches = await User.find({ role: 'COACH' }).select('firstName lastName title about averageRating imageUrl _id');
    res.status(200).json(coaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};
