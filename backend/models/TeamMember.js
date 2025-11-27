const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true, // e.g., "Lead Architect"
  },
  photo: {
    url: { type: String, required: true },
    public_id: { type: String, required: true } // Crucial for deletion!
  },
  order: {
    type: Number,
    default: 0 // To help you sort them later if needed
  }
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
