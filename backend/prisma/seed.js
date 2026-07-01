const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const fieldPassword = await bcrypt.hash('field123', 10);
  const pastorPassword = await bcrypt.hash('pastor123', 10);
  const elderPassword = await bcrypt.hash('elder123', 10);

  // 1. Seed Hierarchy
  console.log('Seeding locations hierarchy...');
  const union = await prisma.union.upsert({
    where: { id: 'd3b07384-d113-4ec6-a5b6-7123456789ab' },
    update: {},
    create: {
      id: 'd3b07384-d113-4ec6-a5b6-7123456789ab',
      name: 'East Central Rwanda Union'
    }
  });

  const field = await prisma.field.upsert({
    where: { id: 'e3b07384-d113-4ec6-a5b6-7123456789cd' },
    update: {},
    create: {
      id: 'e3b07384-d113-4ec6-a5b6-7123456789cd',
      name: 'Gitwe Conference Field',
      unionId: union.id
    }
  });

  const district = await prisma.district.upsert({
    where: { id: 'f3b07384-d113-4ec6-a5b6-7123456789ef' },
    update: {},
    create: {
      id: 'f3b07384-d113-4ec6-a5b6-7123456789ef',
      name: 'Gitwe District',
      fieldId: field.id
    }
  });

  const localChurch = await prisma.localChurch.upsert({
    where: { id: 'a3b07384-d113-4ec6-a5b6-712345678901' },
    update: {},
    create: {
      id: 'a3b07384-d113-4ec6-a5b6-712345678901',
      name: 'Gitwe Ministerial Church',
      districtId: district.id
    }
  });

  // 2. Seed Users
  console.log('Seeding role-based users...');
  
  // Union Admin
  const unionAdmin = await prisma.user.upsert({
    where: { email: 'union-admin@gitweamc.org' },
    update: {},
    create: {
      email: 'union-admin@gitweamc.org',
      name: 'Super Union Administrator',
      password: hashedPassword,
      role: 'UNION_ADMIN',
      unionId: union.id,
      isVerified: true
    }
  });

  // Field Secretary
  const fieldSec = await prisma.user.upsert({
    where: { email: 'field-sec@gitweamc.org' },
    update: {},
    create: {
      email: 'field-sec@gitweamc.org',
      name: 'Jean Paul Field Secretary',
      password: fieldPassword,
      role: 'FIELD_SECRETARY',
      fieldId: field.id,
      isVerified: true
    }
  });

  // Pastor
  const pastor = await prisma.user.upsert({
    where: { email: 'pastor@gitweamc.org' },
    update: {},
    create: {
      email: 'pastor@gitweamc.org',
      name: 'Pastor Gatera Vincent',
      password: pastorPassword,
      role: 'PASTOR',
      districtId: district.id,
      isVerified: true
    }
  });

  // Church Elder
  const elder = await prisma.user.upsert({
    where: { email: 'elder@gitweamc.org' },
    update: {},
    create: {
      email: 'elder@gitweamc.org',
      name: 'Elder Gasana Silas',
      password: elderPassword,
      role: 'ELDER',
      localChurchId: localChurch.id,
      isVerified: true
    }
  });

  // 3. Seed FAQs
  console.log('Seeding FAQs...');
  await prisma.faq.createMany({
    data: [
      {
        question: 'How do I download my digital certificate?',
        answer: 'Navigate to "My Certificate" tab on your dashboard. If you completed a training program successfully, you will see a card with download PDF and share options.',
        category: 'Certificates'
      },
      {
        question: 'Who should submit the evaluation form?',
        answer: 'All enrolled elders are expected to submit an evaluation feedback form upon completion of a course to help improve training quality.',
        category: 'Evaluations'
      }
    ],
    skipDuplicates: true
  });

  // 4. Seed Pastor Availability record
  console.log('Seeding Pastor Availability...');
  await prisma.availability.create({
    data: {
      pastorId: pastor.id,
      date: new Date(),
      status: 'AVAILABLE',
      notes: 'Available for Gitwe Ministerial Church elder registrations review.'
    }
  });

  console.log('Database seeding complete:');
  console.log({ unionAdmin, fieldSec, pastor, elder });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
