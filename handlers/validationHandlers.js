const {body} = require("express-validator")

exports.validateRegistration = [
    body('username').notEmpty().withMessage('Username cannot be empty'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];