import { Request, Response } from "express";
import User from "../models/user.model";
import Email from "../models/email.model";
import bcrypt from "bcryptjs";

export const addUser = async (req: Request, res: Response) => {
    try {
        const findUser = await User.find({ email: req.body.email });
        let role = "CLIENT";
        if (findUser.length > 0) {
            res.status(400).json({ message: "User already exists" });
        } else {
            if (req.body.email === "alex.morgan@energyx.com") {
                role = "ADMIN";
            } else {
                role =
                    (await Email.findOne({ email: req.body.email })) !== null
                        ? "COACH"
                        : "CLIENT";
            }

            // Hash the password before saving the user
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const user = new User({ ...req.body, password: hashedPassword, role });
            const savedUser = await user.save();
            res.status(201).json(savedUser);
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
