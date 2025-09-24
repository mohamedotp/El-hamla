import { PrismaClient, Role } from "@prisma/client";
import { config } from "dotenv";
import { hash } from "bcrypt";

config();

const prisma = new PrismaClient();

async function run() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const salt = process.env.SALT;

  if (!adminUsername) {
    throw Error("ADMIN_USERNAME is a required environment variable");
  }

  if (!adminPassword) {
    throw Error("ADMIN_PASSWORD is a required environment variable");
  }

  if (!salt) {
    throw Error("SALT is a required environment variable");
  }

  const admin = await prisma.user.findUnique({
    where: { username: process.env.ADMIN_USERNAME, role: Role.admin },
  });

  if (!admin) {
    console.log("Creating admin...");

    const passwordHash = await hash(adminPassword, +salt);

    await prisma.user.create({
      data: {
        username: adminUsername,
        role: Role.admin,
        password: passwordHash,
      },
    });

    console.log("✅ admin account created successfully.");
  } else {
    console.log("✅ admin account is present.");
  }
}

run();
