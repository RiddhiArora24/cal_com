require('dotenv').config();
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDatabaseSync() {
  const MAX_RETRIES = 5;
  let attempt = 0;
  let isAwake = false;

  console.log('⏳ Checking Neon Database connection stability via JS async network tunnel...');

  while (attempt < MAX_RETRIES && !isAwake) {
    try {
      attempt++;
      await prisma.$queryRaw`SELECT 1`;
      isAwake = true;
      console.log(' Database server is responsive and fully awake!');
    } catch (error) {
      console.log(`Attempt ${attempt}/${MAX_RETRIES}: DB is booting up or unreachable...`);
      if (attempt < MAX_RETRIES) {
        console.log(' Awaiting 4 seconds before re-pinging the network...');
        await delay(4000);
      } else {
        console.error('Could not establish node pipeline connection after multiple retries.');
        process.exit(1);
      }
    }
  }

  try {
    console.log('Triggering Prisma Schema Synchronization Layer...');
    
    // execSync terminal commands ko JS ke andar syntax execution flow me synchronise rakhta hai
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log(' Schema pushed and synchronized perfectly via JS workflow!');
  } catch (pushError) {
    console.error('Schema pushing transaction layer failed:', pushError.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDatabaseSync();