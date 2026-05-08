const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, requireAdmin, requireProjectMember } = require('../middleware/auth');
const {
  listProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember
} = require('../controllers/projectController');

router.get('/', authenticate, listProjects);

router.post('/', authenticate, requireAdmin, [
  body('name').trim().notEmpty().withMessage('Project name is required'),
], createProject);

router.get('/:id', authenticate, requireProjectMember, getProject);
router.put('/:id', authenticate, requireAdmin, updateProject);
router.delete('/:id', authenticate, requireAdmin, deleteProject);

router.post('/:id/members', authenticate, requireAdmin, [
  body('email').isEmail().withMessage('Valid email required'),
], addMember);

router.delete('/:id/members/:userId', authenticate, requireAdmin, removeMember);

module.exports = router;
