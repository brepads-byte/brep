const express = require('express');
const router = express.Router();
const { getSlides, createSlide, deleteSlide, uploadMiddleware } = require('../controllers/carouselController');
const { protect } = require('../middleware/auth');

// Public endpoints
router.get('/', getSlides);
router.post('/', uploadMiddleware, protect, createSlide);
router.delete('/:id', protect,  deleteSlide);

module.exports = router;