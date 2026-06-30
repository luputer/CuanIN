import { PrismaClient } from "./prisma/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const emails = ["m.saidibjm1@gmail.com", "m.saidibjm4@gmail.com"];
  
  const purchases = await prisma.purchase.findMany({
    where: {
      buyerEmail: { in: emails, mode: "insensitive" },
    },
    include: {
      product: true,
    },
  });

  const portalAccess = await prisma.portalAccess.findMany({
    where: {
      buyerEmail: { in: emails, mode: "insensitive" },
    },
  });

  console.log("=== PURCHASES ===");
  console.log(JSON.stringify(purchases, null, 2));

  console.log("=== PORTAL ACCESS ===");
  console.log(JSON.stringify(portalAccess, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
