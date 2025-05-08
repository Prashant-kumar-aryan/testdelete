import { Request, Response } from 'express';
import User from '../models/user.model';
export const getCoachById= async (req: Request, res: Response): Promise<void> => {
    const { coachId } = req.params;
  try {
    const coach = await User.findById(coachId ).select('firstName lastName title about averageRating imageUrl cognitoId specialization certificates');
    if (!coach) {
      res.status(404).json({ message: "Coach not found" });
      return;
    }
    res.status(200).json(coach);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

