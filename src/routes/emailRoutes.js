const express = require('express');
const { sendEmailController, sendContactController, unsubscribeController } = require('../controllers/emailController');

const { emailSendValidation, contactValidation, unsubscribeValidation } = require('../validations/emailValidation');

const router = express.Router();

router.post('/send', emailSendValidation, sendEmailController);
router.post('/contact', contactValidation, sendContactController);
router.post('/unsubscribe', unsubscribeValidation, unsubscribeController);

module.exports = router;