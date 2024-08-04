import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Retrieve token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            console.error("No token provided");
            return next(new apiError(401, "Unauthorized request"));
        }

        console.log("Token received:", token);

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        console.log("Decoded token:", decodedToken);

        // Validate the token payload
        if (!decodedToken?.id) {
            console.error("Invalid token payload", decodedToken);
            return next(new apiError(401, "Invalid Access Token"));
        }

        // Retrieve the user from the database
        const user = await User.findById(decodedToken.id).select("-password -refreshToken");

        if (!user) {
            console.error("User not found", decodedToken.id);
            return next(new apiError(401, "User not found"));
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error("Error in verifyJWT middleware", error);
        return next(new apiError(401, error.message || "Invalid access token"));
    }
});
