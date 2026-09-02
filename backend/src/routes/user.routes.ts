import { Router } from "express";
import { registerUser,
    loginUser,
    getCurrentUser,
    logOutUser,
    changeUserAvatar,
    getAvailableUsers,
    refreshAccessToken
 } from "../controllers/user.controller.js";
import { signUpSchema } from "../Schemas/signUpSchema.js";
import { signInSchema } from "../Schemas/signInSchema.js";
import { validate } from "../Schemas/validate.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { getTeamMembers } from "../controllers/user.controller.js";

const router=Router()

router.route('/sign-up').post(validate(signUpSchema),registerUser)
router.route('/sign-in').post(validate(signInSchema),loginUser)
router.route('/logout').post(verifyJwt,logOutUser)
router.route('/refresh-token').get(refreshAccessToken)
router.route('/change-avatar').post(verifyJwt,upload.single("avatar"),changeUserAvatar)
router.route('/get-user').get(verifyJwt,getCurrentUser)
router.route('/get-users').get(verifyJwt,getAvailableUsers)
router.route('/team-members').get(verifyJwt,getTeamMembers)

export default router