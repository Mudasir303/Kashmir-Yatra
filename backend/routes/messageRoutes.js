const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
    sendMessage,
    getAllMessages,
    deleteMessage
} = require("../controllers/messageController");

router.post("/", sendMessage);
router.get("/", auth, getAllMessages);
router.delete("/:id", auth, deleteMessage);

module.exports = router;
