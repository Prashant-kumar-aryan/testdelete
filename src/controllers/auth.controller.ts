import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import Email from "../models/email.model";
import { generateAccessToken , generateRefreshToken } from "../utils/generateTokens"
import { registerSchema } from "../services/register.service";
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

        const isPasswordValid = await bcrypt.compare(password , user.password );
        const accessToken =  generateAccessToken(user._id as string, user.email , user.role);
        const refreshToken =  generateRefreshToken(user._id as string);
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
                firstName:user.firstName,
                lastName:user.lastName,
                role: user.role,
            },
            tokens:{
                accessToken,
                refreshToken,
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

const addUser = async (req: Request, res: Response) => {
    try {
        // Validate the request body against the schema
        const validationResult = registerSchema.safeParse(req.body);

        if (!validationResult.success) {
            // If validation fails, return the error messages
            res.status(400).json({ 
                status:"failed",
                message: "Validation error", 
                errors: validationResult.error.errors 
            });
            return;
        }

        const findUser = await User.find({ email: req.body.email });
        let role = "CLIENT";
        if (findUser.length > 0) {
            res.status(400).json({status:"failed", message: "User already exists" });
            return;
        }

        if (req.body.email === "alex.morgan@energyx.com") {
            role = "ADMIN";
        } else {
            role = (await Email.findOne({ email: req.body.email })) !== null
                ? "COACH"
                : "CLIENT";
        }
        
        // Hash the password before saving the user
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const specialization=req.body.preferableActivity;
        const user = new User({ 
            ...validationResult.data, // Use the validated data
            password: hashedPassword, 
            role,
            specialization,
        });
        const savedUser = await user.save();
        res.status(201).json(
            {
                status: "success",
                message:"User created successfully",
            }
        );
    } catch (error) {
        res.status(500).json({status:"failed", message: "Server Error", error });
    }
};


export {
    addUser,
    login
};