import { PrismaClient, City, Currency, Intent, ListingStatus, PropertyType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }) });
async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);
  const user = await prisma.user.upsert({ where: { email: "demo@property.test" }, update: {}, create: { name: "Demo Owner", email: "demo@property.test", passwordHash, role: Role.USER } });
  await prisma.listing.deleteMany({ where: { ownerId: user.id } });
  await prisma.listing.createMany({ data: [
    { ownerId: user.id, title: "Bright apartment near Inya Lake", description: "A practical city home with natural light and convenient access to local amenities.", intent: Intent.RENT, status: ListingStatus.PUBLISHED, propertyType: PropertyType.APARTMENT, city: City.YANGON, township: "Mayangone", priceAmount: 1800000, currency: Currency.MMK, bedrooms: 2, bathrooms: 2, areaValue: 950, areaUnit: "sq ft", publishedAt: new Date() },
    { ownerId: user.id, title: "Modern condo in Mandalay", description: "Well-kept condo suitable for a family or long-term investment.", intent: Intent.SELL, status: ListingStatus.PUBLISHED, propertyType: PropertyType.CONDO, city: City.MANDALAY, township: "Chanayethazan", priceAmount: 95000000, currency: Currency.MMK, bedrooms: 3, bathrooms: 2, areaValue: 1250, areaUnit: "sq ft", publishedAt: new Date() }
  ] });
}
main().finally(() => prisma.$disconnect());
