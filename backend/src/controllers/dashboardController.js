const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const taskWhere = isAdmin ? {} : { OR: [{ assigneeId: userId }, { createdById: userId }] };
    const now = new Date();

    const [todo, inProgress, done, overdue, myTasks, projects] = await Promise.all([
      prisma.task.count({ where: { ...taskWhere, status: 'TODO' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'DONE' } }),
      prisma.task.findMany({
        where: { ...taskWhere, dueDate: { lt: now }, status: { not: 'DONE' } },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      prisma.task.findMany({
        where: { assigneeId: userId, status: { not: 'DONE' } },
        include: { project: { select: { id: true, name: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      isAdmin
        ? prisma.project.count()
        : prisma.projectMember.count({ where: { userId } }),
    ]);

    res.json({
      stats: { todo, inProgress, done, total: todo + inProgress + done, projects },
      overdue,
      myTasks,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { getDashboard };
