import { Router } from "express";

import {
  sendMessage,
  deleteMessage,
  getAllMessages,
} from "../controllers/message.controller.js";

import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { sendMessageSchema } from "../Schemas/message.schema.js";
import { validate } from "../Schemas/validate.js";

const router = Router();
router.use(verifyJwt);

router
  .route("/:chatId")
  .get(getAllMessages)
  .post(
    upload.fields([{ name: "attachments", maxCount: 5 }]),
    validate(sendMessageSchema),
    sendMessage,
  );

router.route("/:chatId/:messageId").delete(deleteMessage);

export default router;
