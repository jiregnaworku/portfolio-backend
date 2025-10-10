const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 2000 },
  imageUrl: { type: String },
  link: { type: String },
  github: { type: String },
  techStack: [{ type: String }],
  tags: [{ type: String }],
  featured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
