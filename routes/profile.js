const express = require('express');
const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');
const profileController = require("../controllers/profileController");

const auth = require("../middlewares/auth")

router.post("/createProfile", auth, catchErrors(profileController.createProfile));
router.post("/getProfile", auth, catchErrors(profileController.getProfile));
router.post("/updateProfile", auth, catchErrors(profileController.updateProfile));


module.exports = router;