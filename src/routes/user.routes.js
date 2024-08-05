 
import { Router } from "express"; // Corrected from 'router' to 'Router'
import { loginUser, logoutUser, 
    registerUser,refreshAccessToken,
    changeCurrentPassword,getWatchHistory,
    getCurrentUser,updateAccountDetails,
    updateUserAvatar,updateUserCoverImage,
    getUserChannelProfile } from "../controllers/user.controller.js"; // Assuming the file extension is needed
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router(); // Corrected from 'router()' to 'Router()'

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

router.route("/login").post(loginUser)

//secure routes

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("/coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)


export default router;


