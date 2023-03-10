const express = require("express");
const router = express.Router();
const { Message } = require("../db/models/message.js");
const { StatusCodes } = require("http-status-codes");
const { param, body, validationResult } = require("express-validator");
const { getNextId } = require("../db/helper.js");
const { logger } = require("../logger.js");

router.get(
    "/:userId?",
    [
        param("userId")
            .notEmpty()
            .withMessage("The id must be not empty")
            .isNumeric()
            .withMessage("The id must be a number"),
    ],
    async (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(StatusCodes.BAD_REQUEST);
            return next(error.array());
        } else {
            try {
                let messagesFromUser = await Message.find({
                    idCreator: req.params.userId,
                }).select("-_id");
                if (messagesFromUser.length !== 0) {
                    return res
                        .status(StatusCodes.OK)
                        .json({ messages: messagesFromUser });
                } else {
                    res.status(StatusCodes.NOT_FOUND);
                    return next("No messages");
                }
            } catch (err) {
                logger.error(err);
                return next("Server error");
            }
        }
    }
);

router.get(
    "/:userId?/:idMsg?",
    [
        param("userId")
            .notEmpty()
            .withMessage("The user id must be not empty")
            .isNumeric()
            .withMessage("The user id must be a number"),
        param("idMsg")
            .notEmpty()
            .withMessage("The message id must be not empty")
            .isNumeric()
            .withMessage("The message id must be a number"),
    ],
    async (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(StatusCodes.BAD_REQUEST);
            return next(error.array());
        } else {
            try {
                let message = await Message.findOne({
                    idCreator: req.params.userId,
                    id: req.params.idMsg,
                }).select("-_id");
                if (message) {
                    return res
                        .status(StatusCodes.OK)
                        .json({ message: message });
                } else {
                    res.status(StatusCodes.NOT_FOUND);
                    next("No message");
                }
            } catch (err) {
                logger.error(err);
                return next("Server error");
            }
        }
    }
);

router.post(
    "",
    [
        body("text")
            .trim()
            .notEmpty()
            .withMessage("The message must be not empty")
            .isString()
            .withMessage("The message must be a string"),
    ],
    async (req, res, next) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(StatusCodes.BAD_REQUEST);
            return next(error.array());
        } else {
            if (req.isAuth) {
                let idCreator = req.id;
                let messageToInsert = {};
                messageToInsert.id = await getNextId(Message);
                messageToInsert.idCreator = idCreator;
                messageToInsert.date = new Date().toLocaleString("en-US", {
                    timeZone: "Europe/Rome",
                });
                messageToInsert.text = req.body.text;
                messageToInsert.likes = [];
                try {
                    const message = new Message({ ...messageToInsert });
                    let insertedMessage = await message.save();
                    delete insertedMessage._id;
                    return res
                        .status(StatusCodes.CREATED)
                        .json({ message: insertedMessage });
                } catch (err) {
                    logger.error(err);
                    return next("Server error");
                }
            } else {
                res.status(StatusCodes.UNAUTHORIZED);
                next("Unauthorized");
            }
        }
    }
);

module.exports = router;
