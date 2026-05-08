const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

const listProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { tasks: true, members: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      projects = await prisma.project.findMany({
        where: { members: { some: { userId: req.user.id } } },
        include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { tasks: true, members: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    res.json(projects);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, description } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name, description, ownerId: req.user.id,
        members: { create: { userId: req.user.id } },
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json(project);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        _count: { select: { tasks: true } },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const updateProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
    });
    res.json(project);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const deleteProject = async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const addMember = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id, userId: user.id } },
    });
    if (existing) return res.status(400).json({ error: 'User already a member' });

    await prisma.projectMember.create({ data: { projectId: req.params.id, userId: user.id } });
    res.json({ message: 'Member added', user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const removeMember = async (req, res) => {
  try {
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } },
    });
    res.json({ message: 'Member removed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember };
