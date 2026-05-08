const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, requireProjectMember } = require('../middleware/auth');
const { listTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/taskController');

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
];

router.get('/project/:projectId', authenticate, requireProjectMember, listTasks);
router.post('/project/:projectId', authenticate, requireProjectMember, taskValidation, createTask);

router.get('/:id', authenticate, getTask);
router.put('/:id', authenticate, [
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('dueDate').optional({ nullable: true }).isISO8601(),
], updateTask);
router.delete('/:id', authenticate, deleteTask);

module.exports = router;
