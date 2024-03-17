const express = require('express');
const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');
const userController = require("../controllers/userController");
const {validateRegistration} = require('../handlers/validationHandlers')

router.post("/login",catchErrors(userController.login));
router.post("/register", validateRegistration ,catchErrors(userController.register));

module.exports = router;
