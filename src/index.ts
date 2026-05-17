import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import routes from "./routes/index.js";

export const app = express();
export const PORT = process.env.PORT || 8080;
export default app;
module.exports = app;

app.use(express.json());
app.use(cors({ origin: [process.env.FRONTEND_URL, "http://localhost:5173"].filter(Boolean) as string[], credentials: true }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", routes);

app.use((_req, res) => res.status(404).json({ message: "Not found" }));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
}
