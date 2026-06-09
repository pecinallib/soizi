import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

function generateAccountNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SOIZI-${part(4)}-${part(4)}`;
}

async function main(): Promise<void> {
  const usersWithoutAccount = await prisma.user.findMany({
    where: { accountNumber: null },
    select: { id: true, email: true },
  });

  if (usersWithoutAccount.length === 0) {
    console.log('Nenhum usuário sem número de conta. Nada a fazer.');
    return;
  }

  console.log(`Gerando número de conta para ${usersWithoutAccount.length} usuário(s)...`);

  for (const user of usersWithoutAccount) {
    let accountNumber: string;
    do {
      accountNumber = generateAccountNumber();
    } while (await prisma.user.findUnique({ where: { accountNumber } }));

    await prisma.user.update({
      where: { id: user.id },
      data: { accountNumber },
    });

    console.log(`  ${user.email} → ${accountNumber}`);
  }

  console.log('Concluído!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
