import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_USERS: { email: string; name: string; role: Role }[] = [
  { email: 'alice@example.com', name: 'Alice Author', role: Role.AUTHOR },
  { email: 'bob@example.com', name: 'Bob Reviewer', role: Role.REVIEWER },
  { email: 'carol@example.com', name: 'Carol Reviewer', role: Role.REVIEWER },
  { email: 'admin@example.com', name: 'Ash Admin', role: Role.ADMIN },
  { email: 'viewer@example.com', name: 'Vik Viewer', role: Role.VIEWER },
];

async function main() {
  console.log('Seeding users...');

  for (const user of SEED_USERS) {
    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: user,
    });
    console.log(`  ✓ ${result.role.padEnd(8)} ${result.email}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
