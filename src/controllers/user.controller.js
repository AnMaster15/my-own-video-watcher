import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { upload } from "../utils/cloudnary.js";
import { apiResponse } from "../utils/apiResponse.js";

// Function to generate fresh access and refresh tokens
const generatefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new apiError(404, "User not found");
        }

        const accesstoken = user.generateAccessToken();
        const generatetoken = user.generateRefreshToken();

        user.refreshToken = generatetoken; // Fixed typo here
        await user.save({ validateBeforeSave: false });

        return { accesstoken, generatetoken };

    } catch (error) {
        console.error('Error in generatefreshTokens:', error.message, error.stack); // Log the error
        throw new apiError(500, "Something went wrong while generating tokens");
    }
};

// Handler to register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some(field => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new apiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required");
    }

    const avatar = await upload(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await upload(coverImageLocalPath) : null;

    if (!avatar) {
        throw new apiError(400, "Avatar upload failed");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new apiResponse(200, createdUser, "User registered Successfully"));
});

// Handler to login a user
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!password || (!username && !email)) {
        throw new apiError(400, "Email or username and password are required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) {
        throw new apiError(404, "User not found");
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        throw new apiError(401, "Invalid credentials");
    }

    try {
        const { accesstoken, generatetoken } = await generatefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            secure: true,
            httpOnly: true
        };

        return res.status(200)
            .cookie("accessToken", accesstoken, options)
            .cookie("refreshToken", generatetoken, options)
            .json(new apiResponse(200, { user: loggedInUser, accesstoken, generatetoken }, "User logged in successfully"));

    } catch (error) {
        console.error('Error during login:', error.message, error.stack); // Log the error
        throw new apiError(500, "Something went wrong during login");
    }
});

// Handler to logout a user
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new apiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new apiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.comparePassword(oldPassword)
    if (!isPasswordCorrect) {
        throw new apiError(401, "Old password is incorrect")

    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed successfully"))


})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new apiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body


    if (!fullname || !email) {
        throw new apiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname:fullname,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await upload(avatarLocalPath)

    if (!avatar.url) {
        throw new apiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(//for objects
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "Avatar image updated successfully")
    )
})



const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new apiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await upload(coverImageLocalPath)

    if (!coverImage.url) {
        throw new apiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "Cover image updated successfully")
    )
})




export { registerUser, loginUser, logoutUser, refreshAccessToken ,getCurrentUser,changeCurrentPassword ,updateAccountDetails,updateUserAvatar,updateUserCoverImage};
