import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const hashedPassword = await bcrypt.hash('Password123', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        mobileNumber: '+1234567890',
        address: '123 Main St, Anytown, USA 12345',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
        mobileNumber: '+9876543210',
        address: '456 Oak Ave, Somewhere, USA 67890',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob.johnson@example.com' },
      update: {},
      create: {
        id: '3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        password: hashedPassword,
        mobileNumber: '+5555555555',
        address: '789 Pine Rd, Elsewhere, USA 11111',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  const orders = await Promise.all([
    prisma.order.upsert({
      where: { orderNumber: 'ORD-2024-001' },
      update: {},
      create: {
        id: 'ord-1',
        orderNumber: 'ORD-2024-001',
        buyerName: 'John Doe',
        status: 'DELIVERED',
        orderDate: new Date('2024-01-15'),
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-2024-002' },
      update: {},
      create: {
        id: 'ord-2',
        orderNumber: 'ORD-2024-002',
        buyerName: 'Jane Smith',
        status: 'SHIPPED',
        orderDate: new Date('2024-02-20'),
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-2024-003' },
      update: {},
      create: {
        id: 'ord-3',
        orderNumber: 'ORD-2024-003',
        buyerName: 'Bob Johnson',
        status: 'PROCESSING',
        orderDate: new Date('2024-03-10'),
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-2024-004' },
      update: {},
      create: {
        id: 'ord-4',
        orderNumber: 'ORD-2024-004',
        buyerName: 'John Doe',
        status: 'PENDING',
        orderDate: new Date('2024-04-05'),
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-2024-005' },
      update: {},
      create: {
        id: 'ord-5',
        orderNumber: 'ORD-2024-005',
        buyerName: 'Jane Smith',
        status: 'CANCELLED',
        orderDate: new Date('2024-05-12'),
      },
    }),
  ]);

  console.log(`✅ Created ${orders.length} orders`);

  const loginRecords = await Promise.all([
    prisma.loginRecord.create({
      data: {
        userId: '1',
        activityType: 'LOGIN',
        timestamp: new Date('2024-10-01T08:30:00Z'),
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }),
    prisma.loginRecord.create({
      data: {
        userId: '2',
        activityType: 'LOGIN',
        timestamp: new Date('2024-10-02T09:15:00Z'),
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
    }),
    prisma.loginRecord.create({
      data: {
        userId: '1',
        activityType: 'LOGOUT',
        timestamp: new Date('2024-10-01T17:00:00Z'),
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }),
  ]);

  console.log(`✅ Created ${loginRecords.length} login records`);

  console.log('🎉 Database seed completed!');
  console.log('\n📝 Demo Login Credentials:');
  console.log('   Email: john.doe@example.com');
  console.log('   Password: Password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
