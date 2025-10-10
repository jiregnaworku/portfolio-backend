const { Router } = require('express');
const { listProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { authRequired } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = Router();

// Public
router.get('/', listProjects);
router.get('/:id', getProject);

// Admin
router.post('/', authRequired, upload.single('image'), createProject);
router.put('/:id', authRequired, upload.single('image'), updateProject);
router.delete('/:id', authRequired, deleteProject);

module.exports = router;
