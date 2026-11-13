// 种子数据：初始化演示用的账号、图书与借阅记录。
// 执行方式：npm run db:seed（Prisma 会调用 tsx 运行本文件）

import "dotenv/config";

import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

async function main() {
  // 先删子表再删主表，避免外键约束报错
  await prisma.loan.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "管理员",
      password: hashPassword("admin123"),
      role: "ADMIN",
    },
  });

  const reader = await prisma.user.create({
    data: {
      email: "reader@example.com",
      name: "林小满",
      password: hashPassword("reader123"),
      role: "READER",
    },
  });

  const books = [
    {
      title: "活着",
      author: "余华",
      isbn: "9787506365437",
      category: "文学",
      publisher: "作家出版社",
      publishYear: 2012,
      summary: "一个普通人在时代变迁中守住生命本身的故事。",
      totalCopies: 3,
    },
    {
      title: "百年孤独",
      author: "加西亚·马尔克斯",
      isbn: "9787544253994",
      category: "文学",
      publisher: "南海出版公司",
      publishYear: 2011,
      summary: "布恩迪亚家族七代人的兴衰，魔幻现实主义的代表作。",
      totalCopies: 2,
    },
    {
      title: "围城",
      author: "钱钟书",
      isbn: "9787020090006",
      category: "文学",
      publisher: "人民文学出版社",
      publishYear: 1991,
      summary: "以幽默笔法写知识分子的婚姻与困境。",
      totalCopies: 2,
    },
    {
      title: "深入理解计算机系统",
      author: "Randal E. Bryant",
      isbn: "9787111544937",
      category: "科技",
      publisher: "机械工业出版社",
      publishYear: 2016,
      summary: "从程序员视角讲解计算机系统的底层运作。",
      totalCopies: 2,
    },
    {
      title: "代码整洁之道",
      author: "Robert C. Martin",
      isbn: "9787115216878",
      category: "科技",
      publisher: "人民邮电出版社",
      publishYear: 2010,
      summary: "如何写出可读、可维护的代码。",
      totalCopies: 4,
    },
    {
      title: "数据结构与算法分析",
      author: "Mark Allen Weiss",
      isbn: "9787111539964",
      category: "科技",
      publisher: "机械工业出版社",
      publishYear: 2016,
      summary: "C 语言描述的数据结构与算法基础教材。",
      totalCopies: 3,
    },
    {
      title: "万历十五年",
      author: "黄仁宇",
      isbn: "9787108009821",
      category: "历史",
      publisher: "生活·读书·新知三联书店",
      publishYear: 1997,
      summary: "从一个平常年份切入，观察明代制度的困局。",
      totalCopies: 2,
    },
    {
      title: "人类简史",
      author: "尤瓦尔·赫拉利",
      isbn: "9787508647357",
      category: "历史",
      publisher: "中信出版社",
      publishYear: 2014,
      summary: "从认知革命到科学革命，重述人类的来路。",
      totalCopies: 3,
    },
    {
      title: "经济学原理",
      author: "N. 格里高利·曼昆",
      isbn: "9787301256916",
      category: "经济",
      publisher: "北京大学出版社",
      publishYear: 2015,
      summary: "以十大原理为主线的基础经济学教材。",
      totalCopies: 2,
    },
    {
      title: "穷查理宝典",
      author: "彼得·考夫曼",
      isbn: "9787508663448",
      category: "经济",
      publisher: "中信出版社",
      publishYear: 2016,
      summary: "查理·芒格的演讲与多元思维模型。",
      totalCopies: 1,
    },
    {
      title: "艺术的故事",
      author: "贡布里希",
      isbn: "9787807463726",
      category: "艺术",
      publisher: "广西美术出版社",
      publishYear: 2008,
      summary: "从史前壁画到现代艺术的通史读物。",
      totalCopies: 2,
    },
    {
      title: "设计中的设计",
      author: "原研哉",
      isbn: "9787543225978",
      category: "艺术",
      publisher: "山东人民出版社",
      publishYear: 2006,
      summary: "关于日常与留白的设计思考。",
      totalCopies: 2,
    },
  ];

  const created = [];
  for (const book of books) {
    created.push(await prisma.book.create({ data: book }));
  }

  // 三条借阅记录：一条逾期、一条在借、一条已归还
  await prisma.loan.create({
    data: {
      userId: reader.id,
      bookId: created[0].id, // 活着
      borrowedAt: new Date(now - 33 * DAY),
      dueAt: new Date(now - 3 * DAY),
    },
  });

  await prisma.loan.create({
    data: {
      userId: reader.id,
      bookId: created[7].id, // 人类简史
      borrowedAt: new Date(now - 10 * DAY),
      dueAt: new Date(now + 20 * DAY),
    },
  });

  await prisma.loan.create({
    data: {
      userId: admin.id,
      bookId: created[2].id, // 围城
      borrowedAt: new Date(now - 40 * DAY),
      dueAt: new Date(now - 10 * DAY),
      returnedAt: new Date(now - 12 * DAY),
    },
  });

  console.log(
    `种子数据写入完成：${2} 个用户，${created.length} 本图书，3 条借阅记录`,
  );
}

main()
  .catch((error) => {
    console.error("种子数据写入失败：", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
