 
import { Router } from "express"; // Corrected from 'router' to 'Router'
import { registerUser } from "../controllers/user.controller.js"; // Assuming the file extension is needed
import {upload} from "../middlewares/multer.middleware.js"
const router = Router(); // Corrected from 'router()' to 'Router()'

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

export default router;
