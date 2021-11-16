const express = require('express');
const { getAccessToRoute,getAnswerOwnerAccess} = require('../middlewares/authorization/auth');
const { addNewAnswerToQuestion,getAllAnswers,getSingleAnswer,editAnswer,deleteAnswer,likeAnswer,undoLikeAnswer} = require('../controllers/answer');
const { checkQuestionAndAnswerExist } = require('../middlewares/database/databaseHelper');

const router = express.Router({mergeParams:true});

router.post("/",getAccessToRoute,addNewAnswerToQuestion);
router.get("/",getAllAnswers);
router.get("/:answer_id",checkQuestionAndAnswerExist,getSingleAnswer);
router.get("/:answer_id/like",[checkQuestionAndAnswerExist,getAccessToRoute],likeAnswer);
router.get("/:answer_id/undoLike",[checkQuestionAndAnswerExist,getAccessToRoute],undoLikeAnswer);
router.put("/:answer_id/edit",[checkQuestionAndAnswerExist,getAccessToRoute,getAnswerOwnerAccess],editAnswer);
router.delete("/:answer_id/delete",[checkQuestionAndAnswerExist,getAccessToRoute,getAnswerOwnerAccess],deleteAnswer);

module.exports = router;