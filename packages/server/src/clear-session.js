import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.whatsAppSession.deleteMany({ where: { userId: 1 } });
  console.log('Session for user 1 deleted');
  await prisma.$disconnect();
}
main();
