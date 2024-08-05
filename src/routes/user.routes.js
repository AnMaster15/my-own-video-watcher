 
import { Router } from "express"; // Corrected from 'router' to 'Router'
import { loginUser, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.controller.js"; // Assuming the file extension is needed
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

export default router;


