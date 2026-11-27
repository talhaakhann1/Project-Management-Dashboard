import { Router } from "express";
import {
    addNewParticipantInGroupChat,
    createAGroupChat,
    createOrGetAOneOnOneChat,
    deleteGroupChat,
    deleteOneOnOneChat,
    getAllChats,
    getGroupChatDetails,
    leaveGroupChat,
    removeParticipantFromGroupChat,
    renameGroupChat,
    changeAdmin,
    searchAvailableUsers,
} from "../controllers/chat.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { createAGroupChatSchema, updateGroupChatNameSchema } from "../Schemas/chat.schema.js";
import { validate } from "../Schemas/validate.js";


const router = Router()

router.use(verifyJwt);

router.route("/").get(getAllChats);

router.route("/users").get(searchAvailableUsers);


router
    .route("/c/:receiverId")
    .post(

        createOrGetAOneOnOneChat
    );

router
    .route("/group")
    .post(validate(createAGroupChatSchema) , createAGroupChat);

router
    .route("/group/:chatId")
    .get(getGroupChatDetails)
    .patch(
       
        validate(updateGroupChatNameSchema),
        renameGroupChat
    )
    .delete(deleteGroupChat);

router
    .route("/group/:chatId/:participantId")
    .post(
        addNewParticipantInGroupChat
    )
    .delete(
        removeParticipantFromGroupChat
    );

router
    .route("/leave/group/:chatId")
    .delete(leaveGroupChat);

router
    .route("/remove/:chatId")
    .delete(deleteOneOnOneChat);

router
    .route("/change-admin/:userId/:chatId")
    .get(
        changeAdmin
    )



export default router