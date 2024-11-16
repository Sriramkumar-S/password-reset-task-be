import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const createJwtToken = (payload, expiry) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiry });
};