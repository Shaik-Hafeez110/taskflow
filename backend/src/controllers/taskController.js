const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
};

const listTasks = async (req, res) => {
  const { status, priority, assigneeId } = req.query;
  const projectId = req.params.projectId;
  try {
    const where = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (req.user.role === 'MEMBER') {
      where.OR = [{ assigneeId: req.user.id }, { createdById: req.user.id }];
    }
    const tasks = await prisma.task.findMany({ where, include: taskInclude, orderBy: { createdAt: 'desc' } });
    res.json(tasks);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { title, description, status, priority, dueDate, assigneeId } = req.body;
  const projectId = req.params.projectId;
  try {
    if (assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assigneeId } },
      });
      if (!member) return res.status(400).json({ error: 'Assignee is not a project member' });
    }
    const task = await prisma.task.create({
      data: { title, description, status, priority, dueDate: dueDate ? new Date(dueDate) : null, projectId, assigneeId, createdById: req.user.id },
      include: taskInclude,
    });
    res.status(201).json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id }, include: taskInclude });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { title, description, status, priority, dueDate, assigneeId } = req.body;
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role === 'MEMBER' && task.assigneeId !== req.user.id && task.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId }),
      },
      include: taskInclude,
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role === 'MEMBER' && task.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Only admins or task creators can delete tasks' });
    }
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { listTasks, createTask, getTask, updateTask, deleteTask };
