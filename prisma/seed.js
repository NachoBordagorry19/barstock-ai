require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const initialBottles = [
  { id: "b1", name: "Johnnie Walker Red Label", category: "Whisky", barcode: "5000267023656", sealed: 2, open: 1, empty: 0, threshold: 3, price: 18900 },
  { id: "b2", name: "Johnnie Walker Black Label", category: "Whisky", barcode: "5000267034706", sealed: 1, open: 1, empty: 1, threshold: 2, price: 32500 },
  { id: "b3", name: "Smirnoff Vodka", category: "Vodka", barcode: "5410316950107", sealed: 5, open: 2, empty: 1, threshold: 4, price: 9800 },
  { id: "b4", name: "Skyy Vodka", category: "Vodka", barcode: "0080686847908", sealed: 3, open: 1, empty: 0, threshold: 3, price: 12400 },
  { id: "b5", name: "Bacardí Carta Blanca", category: "Ron", barcode: "7501035010994", sealed: 4, open: 1, empty: 2, threshold: 3, price: 11200 },
  { id: "b6", name: "Fernet Branca", category: "Amargo", barcode: "7790140001017", sealed: 6, open: 2, empty: 1, threshold: 5, price: 14700 },
  { id: "b7", name: "José Cuervo Especial", category: "Tequila", barcode: "7501035042032", sealed: 2, open: 1, empty: 0, threshold: 3, price: 16800 },
  { id: "b8", name: "Vat 69", category: "Whisky", barcode: "5000289110105", sealed: 1, open: 0, empty: 1, threshold: 2, price: 9600 },
  { id: "b9", name: "Campari", category: "Aperitivo", barcode: "8000400000018", sealed: 3, open: 1, empty: 0, threshold: 2, price: 13900 }
];

const initialScannerUsers = [
  { id: "s1", name: "Martín Gómez", role: "DESPACHADOR", active: true },
  { id: "s2", name: "Lucía Fernández", role: "RECEPTOR", active: true },
  { id: "s3", name: "Diego Sosa", role: "RECEPTOR", active: false },
  { id: "s4", name: "Valentina Ruiz", role: "DESPACHADOR", active: true }
];

const initialBranchAdmins = [
  { id: "a1", name: "Carlos Medina", role: "ADMIN", active: true },
  { id: "a2", name: "Sofía Álvarez", role: "ADMIN", active: true },
  { id: "a3", name: "Javier Paredes", role: "ADMIN", active: false }
];

async function main() {
  console.log("Seeding started...");

  // Seed Users
  for (const u of [...initialBranchAdmins, ...initialScannerUsers]) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        role: u.role,
        active: u.active
      },
      create: {
        id: u.id,
        name: u.name,
        role: u.role,
        active: u.active
      }
    });
  }
  console.log("Users seeded.");

  // Seed Products and StockItems
  for (const b of initialBottles) {
    const cost = Math.round(b.price / 1.20);
    const stockTotal = b.sealed + b.open;

    await prisma.product.upsert({
      where: { id: b.id },
      update: {
        name: b.name,
        category: b.category,
        barcode: b.barcode,
        stock: stockTotal,
        cost: cost,
        marginPercent: 20,
        price: b.price
      },
      create: {
        id: b.id,
        name: b.name,
        category: b.category,
        barcode: b.barcode,
        stock: stockTotal,
        cost: cost,
        marginPercent: 20,
        price: b.price
      }
    });

    // Seed StockItem for Depósito
    if (b.sealed > 0) {
      await prisma.stockItem.upsert({
        where: {
          productId_location: {
            productId: b.id,
            location: "depósito"
          }
        },
        update: {
          quantity: b.sealed
        },
        create: {
          productId: b.id,
          location: "depósito",
          quantity: b.sealed
        }
      });
    }

    // Seed StockItem for Barra
    if (b.open > 0) {
      await prisma.stockItem.upsert({
        where: {
          productId_location: {
            productId: b.id,
            location: "barra"
          }
        },
        update: {
          quantity: b.open
        },
        create: {
          productId: b.id,
          location: "barra",
          quantity: b.open
        }
      });
    }
  }
  console.log("Products and StockItems seeded.");
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
