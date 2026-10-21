import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./api/index.js";

async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = parseInt(process.env.PORT || '3000', 10);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Praja Mitra] Backend running on port ${PORT}`);
  });
}

setupServer();
