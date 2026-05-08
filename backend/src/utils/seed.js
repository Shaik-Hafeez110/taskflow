require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash('admin1234', 12);
  const memberHash = await bcrypt.hash('member1234', 12);

  const admin = await prisma.user.create({
    data: { name: 'Alex Admin', email: 'admin@taskflow.com', passwordHash: adminHash, role: 'ADMIN' },
  });

  const alice = await prisma.user.create({
    data: { name: 'Alice Chen', email: 'alice@taskflow.com', passwordHash: memberHash, role: 'MEMBER' },
  });

  const bob = await prisma.user.create({
    data: { name: 'Bob Singh', email: 'bob@taskflow.com', passwordHash: memberHash, role: 'MEMBER' },
  });

  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Full redesign of the company website with new branding',
      ownerId: admin.id,
      members: { create: [{ userId: admin.id }, { userId: alice.id }, { userId: bob.id }] },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App v2',
      description: 'Second version of the mobile application',
      ownerId: admin.id,
      members: { create: [{ userId: admin.id }, { userId: alice.id }] },
    },
  });

  const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      { title: 'Design homepage mockup', description: 'Create Figma mockups for the new homepage', status: 'DONE', priority: 'HIGH', projectId: project1.id, assigneeId: alice.id, createdById: admin.id, dueDate: pastDate },
      { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated deployment', status: 'IN_PROGRESS', priority: 'HIGH', projectId: project1.id, assigneeId: bob.id, createdById: admin.id, dueDate: futureDate },
      { title: 'Write API documentation', description: 'Document all REST endpoints using Swagger', status: 'TODO', priority: 'MEDIUM', projectId: project1.id, assigneeId: alice.id, createdById: admin.id, dueDate: futureDate },
      { title: 'Fix navbar mobile bug', description: 'Hamburger menu not closing on mobile Safari', status: 'TODO', priority: 'HIGH', projectId: project1.id, assigneeId: bob.id, createdById: alice.id, dueDate: pastDate },
      { title: 'SEO audit and fixes', status: 'TODO', priority: 'LOW', projectId: project1.id, createdById: admin.id, dueDate: futureDate },
      { title: 'User authentication flow', description: 'Implement biometric login for mobile app', status: 'IN_PROGRESS', priority: 'HIGH', projectId: project2.id, assigneeId: alice.id, createdById: admin.id, dueDate: futureDate },
      { title: 'Push notification system', status: 'TODO', priority: 'MEDIUM', projectId: project2.id, assigneeId: alice.id, createdById: admin.id, dueDate: pastDate },
      { title: 'App Store screenshots', description: 'Create screenshots for iOS and Android store listings', status: 'TODO', priority: 'LOW', projectId: project2.id, createdById: admin.id },
    ],
  });

  console.log('Seed complete!');
  console.log('Admin:  admin@taskflow.com / admin1234');
  console.log('Member: alice@taskflow.com / member1234');
  console.log('Member: bob@taskflow.com   / member1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());
