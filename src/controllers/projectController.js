const fs = require('fs');
const Project = require('../models/Project');
const { cloudinaryEnabled, uploadToCloudinary } = require('../config/cloudinary');

const buildLocalUrl = (filename) => `/uploads/${filename}`;

const parseMaybeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const listProjects = async (req, res) => {
  const projects = await Project.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json(projects);
};

const getProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
};

const createProject = async (req, res, next) => {
  try {
    const { title, description, link, github, techStack, tags, featured, sortOrder } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description are required' });

    let imageUrl;
    if (req.file) {
      if (cloudinaryEnabled) {
        const uploaded = await uploadToCloudinary(req.file.path);
        imageUrl = uploaded.secure_url;
        fs.unlink(req.file.path, () => {});
      } else {
        imageUrl = buildLocalUrl(req.file.filename);
      }
    }

    const doc = await Project.create({
      title,
      description,
      link,
      github,
      techStack: parseMaybeArray(techStack),
      tags: parseMaybeArray(tags),
      featured: featured === 'true' || featured === true,
      sortOrder: Number(sortOrder) || 0,
      imageUrl
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prev = await Project.findById(id);
    if (!prev) return res.status(404).json({ message: 'Project not found' });

    const updates = {
      title: req.body.title ?? prev.title,
      description: req.body.description ?? prev.description,
      link: req.body.link ?? prev.link,
      github: req.body.github ?? prev.github,
      techStack: req.body.techStack ? parseMaybeArray(req.body.techStack) : prev.techStack,
      tags: req.body.tags ? parseMaybeArray(req.body.tags) : prev.tags,
      featured: typeof req.body.featured !== 'undefined' ? (req.body.featured === 'true' || req.body.featured === true) : prev.featured,
      sortOrder: typeof req.body.sortOrder !== 'undefined' ? Number(req.body.sortOrder) : prev.sortOrder
    };

    if (req.file) {
      if (cloudinaryEnabled) {
        const uploaded = await uploadToCloudinary(req.file.path);
        updates.imageUrl = uploaded.secure_url;
        fs.unlink(req.file.path, () => {});
      } else {
        updates.imageUrl = buildLocalUrl(req.file.filename);
      }
    }

    const doc = await Project.findByIdAndUpdate(id, updates, { new: true });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prev = await Project.findById(id);
    if (!prev) return res.status(404).json({ message: 'Project not found' });
    await prev.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject };
