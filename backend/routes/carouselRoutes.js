const express = require('express');
const router = express.Router();
const { getSlides, createSlide, deleteSlide, uploadMiddleware } = require('../controllers/carouselController');
const { protect } = require('../middleware/auth');

// Public endpoints: Anyone visiting your homepage can pull down the active showcase slides
router.get('/', getSlides);

// Secure endpoints: Multi-part file parsed first, identity token verified second, Super Admin role confirmed third
router.post('/', uploadMiddleware, protect, createSlide);
router.delete('/:id', protect, deleteSlide);

module.exports = router;