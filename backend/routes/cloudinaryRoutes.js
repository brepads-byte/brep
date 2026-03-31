const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

router.get('/signature', (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const paramsToSign = {
      timestamp,
      folder: 'architecture_portfolio',
      transformation: 'w_2000,c_limit,q_auto,f_auto' 
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    res.status(500).json({ message: "Signature generation failed", error: error.message });
  }
});

module.exports = router;