import express from "express";
import prisma from "./prisma/client.js";
import dotenv from "dotenv";
import cors from "cors";
import staffRoutes from "./api/v1/routes/staffRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Staff Management API
app.use("/api/v1", staffRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database Connected");

    app.listen(PORT, () => {
      console.log(`Server Running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the Database:", error);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Prisma Disconnected");
  process.exit(0);
});