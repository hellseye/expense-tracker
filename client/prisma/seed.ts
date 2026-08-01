import { PrismaClient, PaymentMethod } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Seed User
  const user = await prisma.user.upsert({
    where: { email: "mayank@ledger.dev" },
    update: {
      passwordHash: "$2b$10$se0HYTKnfyax4ODqgEopJOTUsPJciujIlm2hh8JNhGeAvJxUDQzA.",
    },
    create: {
      name: "Mayank",
      email: "mayank@ledger.dev",
      emailVerified: true,
      currency: "INR",
      theme: "dark",
      passwordHash: "$2b$10$se0HYTKnfyax4ODqgEopJOTUsPJciujIlm2hh8JNhGeAvJxUDQzA.", // bcrypt hash for "password123"
    },
  });

  console.log(`👤 User created/found: ${user.name} (${user.id})`);

  // 2. Seed Categories
  const defaultCategories = [
    { name: "Food & Dining", color: "#10B981", icon: "utensils" },
    { name: "Housing & Rent", color: "#8B5CF6", icon: "home" },
    { name: "Shopping & Tech", color: "#3B82F6", icon: "shopping-bag" },
    { name: "Subscriptions", color: "#A855F7", icon: "tv" },
    { name: "Transportation", color: "#F59E0B", icon: "car" },
    { name: "Utilities & Bills", color: "#06B6D4", icon: "zap" },
  ];

  const createdCategories = [];
  for (const cat of defaultCategories) {
    const category = await prisma.category.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: cat.name,
        },
      },
      update: {
        color: cat.color,
        icon: cat.icon,
      },
      create: {
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        userId: user.id,
      },
    });
    createdCategories.push(category);
  }

  console.log(`🏷️  Seeded ${createdCategories.length} categories.`);

  // 3. Seed Expenses
  const now = new Date();
  const getDaysAgo = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d;
  };

  const sampleExpenses = [
    {
      title: "Linear & GitHub Pro Subscriptions",
      amount: 1499.0,
      expenseDate: getDaysAgo(0),
      notes: "Monthly subscriptions for development & issue tracking",
      paymentMethod: PaymentMethod.UPI,
      categoryName: "Subscriptions",
    },
    {
      title: "Grocery Shopping at Nature's Basket",
      amount: 3450.0,
      expenseDate: getDaysAgo(0),
      notes: "Weekly groceries, fruits & organic produce",
      paymentMethod: PaymentMethod.UPI,
      categoryName: "Food & Dining",
    },
    {
      title: "MacBook Pro Sleeve & USB-C Hub",
      amount: 4290.0,
      expenseDate: getDaysAgo(1),
      notes: "Leather sleeve and Satechi multi-port hub",
      paymentMethod: PaymentMethod.CREDIT_CARD,
      categoryName: "Shopping & Tech",
    },
    {
      title: "Blue Tokai Coffee & Bakery",
      amount: 680.0,
      expenseDate: getDaysAgo(2),
      notes: "Cold brew roast & artisanal croissants",
      paymentMethod: PaymentMethod.UPI,
      categoryName: "Food & Dining",
    },
    {
      title: "Apartment Monthly Maintenance & HOA",
      amount: 18500.0,
      expenseDate: getDaysAgo(3),
      notes: "Building maintenance, security & parking fees",
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      categoryName: "Housing & Rent",
    },
    {
      title: "Uber Cab to Business Park",
      amount: 420.0,
      expenseDate: getDaysAgo(4),
      notes: "Morning commute during heavy rain",
      paymentMethod: PaymentMethod.UPI,
      categoryName: "Transportation",
    },
    {
      title: "AWS Cloud Infrastructure Hosting",
      amount: 5400.0,
      expenseDate: getDaysAgo(5),
      notes: "EC2 instances, S3 storage & DNS hosting",
      paymentMethod: PaymentMethod.CREDIT_CARD,
      categoryName: "Subscriptions",
    },
    {
      title: "Team Dinner at Pa Pa Ya",
      amount: 7200.0,
      expenseDate: getDaysAgo(7),
      notes: "Quarterly team milestone celebration dinner",
      paymentMethod: PaymentMethod.CREDIT_CARD,
      categoryName: "Food & Dining",
    },
    {
      title: "High-Speed Fiber Broadband Bill",
      amount: 1499.0,
      expenseDate: getDaysAgo(10),
      notes: "Airtel Xstream 300Mbps symmetrical fiber connection",
      paymentMethod: PaymentMethod.UPI,
      categoryName: "Utilities & Bills",
    },
    {
      title: "Cult.fit Club Gym Membership",
      amount: 14500.0,
      expenseDate: getDaysAgo(12),
      notes: "Annual Cult Pass Elite membership",
      paymentMethod: PaymentMethod.CREDIT_CARD,
      categoryName: "Subscriptions",
    },
  ];

  // Clean old expenses to prevent duplication on multiple seeds
  await prisma.expense.deleteMany({
    where: { userId: user.id },
  });

  for (const exp of sampleExpenses) {
    const category = createdCategories.find((c) => c.name === exp.categoryName);
    if (!category) continue;

    await prisma.expense.create({
      data: {
        title: exp.title,
        amount: exp.amount,
        expenseDate: exp.expenseDate,
        notes: exp.notes,
        paymentMethod: exp.paymentMethod,
        categoryId: category.id,
        userId: user.id,
      },
    });
  }

  console.log(`💸 Seeded ${sampleExpenses.length} initial transactions.`);
  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
