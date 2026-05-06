import prisma from '../src/lib/prisma.js';
const users = await prisma.user.findMany();
console.log(users.map(u => ({ id: u.id, email: u.email })));
process.exit(0);
