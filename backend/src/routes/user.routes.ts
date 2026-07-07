import { Router } from "express";
import { registerUser,
    loginUser,
    getCurrentUser,
    logOutUser,
    changeUserAvatar,
    getAvailableUsers

 } from "../controllers/user.controller.js";
import { signupSchema } from "../Schemas/signUpSchema.js";
import { loginSchema } from "../Schemas/loginSchema.js";
import { validate } from "../Schemas/validate.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router=Router()

router.route('/signUp').post(validate(signupSchema),registerUser)
router.route('/login').post(validate(loginSchema),loginUser)
router.route('/logout').get(verifyJwt,logOutUser)
router.route('/change-avatar').post(verifyJwt,upload.single("avatar"),changeUserAvatar)
router.route('/get-user').get(verifyJwt,getCurrentUser)
router.route('/get-users').get(verifyJwt,getAvailableUsers)

export default router