const express = require('express');
const { getSingleUser,getAllUser} = require('../controllers/user');
const { checkUserExist} = require('../middlewares/database/databaseHelper');
const userQueryMiddleware = require('../middlewares/query/userQueryMiddleware');
const User = require('../models/User');

const router = express.Router();

router.get("/",userQueryMiddleware(User),getAllUser);
router.get("/:id",checkUserExist,getSingleUser);

module.exports = router;
