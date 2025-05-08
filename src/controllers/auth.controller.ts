import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
            return;
        }

        const user = await User.findOne({ email });

        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {

                id: user._id,
                email: user.email,
                firstname:user.firstname,
                lastname:user.lastname,

            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export {
    login
};