const mongoose = require('mongoose');

const ProjectPhotoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true }, // The key for deletion
  caption: { type: String, default: '' },
});

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['home', 'commercial', 'hospitality', 'interiors'], 
    required: true 
  },
  sqft: { type: Number, required: true }, // Changed to Number for strict validation
  location: { type: String, required: true },
  mainPhoto: {
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  },
  description: { type: String, required: true },
  descriptionPhotos: [ProjectPhotoSchema],
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);