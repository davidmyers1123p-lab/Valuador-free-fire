import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.post("/api/evaluate", async (req, res) => {
    try {
      const { items, level, rank, region } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "No items provided" });
      }

      const prompt = `
        As an expert Garena Free Fire account valuator, precisely estimate the market value of this account.
        
        Account Details:
        - Level: ${level}
        - Rank: ${rank}
        - Region: ${region}
        - Inventory: ${items.join(", ")}
        
        Specific valuation rules to follow:
        1. Give extreme weight to early Elite Passes (Season 1-5).
        2. Evaluate Evolutive Weapons based on their total upgrade cost (typically $100+ USD to max out).
        3. Consider rank and level as secondary multipliers.
        4. Adjust for regional economy (e.g., Brazil/India/Latam have high demand but different price points).
        
        Return a detailed valuation report in JSON format.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estimatedValueRange: { type: Type.STRING },
              breakdown: { type: Type.STRING },
              rarityScore: { type: Type.NUMBER },
              topRarityItems: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["estimatedValueRange", "breakdown", "rarityScore", "topRarityItems"]
          }
        }
      });

      const responseText = response.text || "{}";
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Evaluation Error:", error);
      res.status(500).json({ error: "Failed to evaluate account" });
    }
  });

  app.post("/api/fetch-account-details", async (req, res) => {
    try {
      const { playerId } = req.body;
      
      const prompt = `
        Generate a realistic Free Fire account profile for someone with the Player ID: ${playerId}.
        The profile should include:
        1. A believable "nickname" (gaming style).
        2. A "level" between 40 and 85.
        3. A "rank" from [Bronze, Silver, Gold, Platinum, Diamond, Heroic, Master, Grandmaster].
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nickname: { type: Type.STRING },
              level: { type: Type.NUMBER },
              rank: { type: Type.STRING }
            },
            required: ["nickname", "level", "rank"]
          }
        }
      });

      const responseText = response.text || "{}";
      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("Fetch Details Error:", error);
      res.status(500).json({ error: "Failed to fetch account details" });
    }
  });

  // Vite middleware for development
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
