require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const MAX_RETRIES = 5;
  let attempt = 0;
  let connected = false;

  console.log('Initializing connection tunnel verification engine...');

  while (attempt < MAX_RETRIES && !connected) {
    try {
      attempt++;

      await prisma.$queryRaw`SELECT 1`;
      connected = true;
      console.log('Database tunnel connected and fully awake!');
    } catch (error) {
      console.log(` Connection attempt ${attempt}/${MAX_RETRIES} timed out. Serverless DB is waking up...`);
      if (attempt < MAX_RETRIES) {
        console.log(' Waiting 3 seconds before pooling next check...');
        await delay(3000); 
      } else {
        throw new Error("Could not reach database host after multiple retry pooling sessions.");
      }
    }
  }

  console.log('Flushing old database records...');
  await prisma.booking.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.eventType.deleteMany({});
  
  console.log('Seeding default event layout assets...');
  await prisma.eventType.createMany({
    data: [
      {
        title: '15-Minute Sync',
        description: 'Quick catch-up, alignment check, or brief project status update.',
        duration: 15,
        slug: '15-min-sync',
      },
      {
        title: 'Deep-Dive Technical Interview',
        description: 'Comprehensive system design and algorithm optimization evaluation.',
        duration: 60,
        slug: 'tech-interview',
      }
    ],
  });

  console.log('Seeding baseline standard operational windows...');
  const weeklyDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  for (const day of weeklyDays) {
    await prisma.availability.create({
      data: {
        dayOfWeek: day,
        date: null,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true
      }
    });
  }

  console.log('Database seeded with polished Cal.ai templates successfully!');
}

main()
  .catch((e) => { 
    console.error('Seeding pipeline failure:', e); 
    process.exit(1); 
  })
  .finally(async () => { 
    await prisma.$disconnect(); 
  });