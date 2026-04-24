const express = require('express');
const { authenticate } = require('../middleware/auth');
const yc = require('../controllers/youtubeController');

const router = express.Router();

router.get('/first-video', authenticate, yc.firstVideo);

module.exports = router;
