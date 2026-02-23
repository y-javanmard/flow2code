import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs/promises";
import { GoogleGenAI } from "@google/genai";

const app = express();

// IMPORTANT for base64 PNG payload
app.use(express.json({ limit: "25mb" }));
app.use(cors({ origin: "*" }));

function safeName(s: string) {
  return String(s || "project").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);
}

// --- Health ---
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --- Save project: flow.json + prompt.txt + diagram.png + generated.json ---
app.post("/api/save-project", async (req, res) => {
  try {
    const { project, flow, promptPack, pngDataUrl, generated } = req.body || {};

    if (!flow?.nodes || !flow?.edges) {
      return res.status(400).json({ error: "Missing flow.nodes/flow.edges" });
    }

    const proj = safeName(project);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dir = path.join(process.cwd(), "data", proj, stamp);

    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(path.join(dir, "flow.json"), JSON.stringify(flow, null, 2), "utf8");

    if (typeof promptPack === "string") {
      await fs.writeFile(path.join(dir, "prompt.txt"), promptPack, "utf8");
    }

    if (generated) {
      await fs.writeFile(path.join(dir, "generated.json"), JSON.stringify(generated, null, 2), "utf8");
    }

    if (typeof pngDataUrl === "string" && pngDataUrl.startsWith("data:image/png;base64,")) {
      const b64 = pngDataUrl.split(",")[1];
      await fs.writeFile(path.join(dir, "diagram.png"), Buffer.from(b64, "base64"));
    }

    res.json({ ok: true, dir });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? String(e) });
  }
});

// --- Gemini codegen ---
app.post("/api/generate-code", async (req, res) => {
  try {
    const { promptPack, language } = req.body || {};
    if (typeof promptPack !== "string" || !promptPack.trim()) {
      return res.status(400).json({ error: "Missing promptPack" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });
    }

    const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

    const ai = new GoogleGenAI({});

    const response = await ai.models.generateContent({
      model,
      contents: promptPack,
    });

    const text = response.text ?? "";

    // Try to parse JSON strictly; fall back to extracting first JSON object
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    if (!parsed) {
      return res.status(500).json({
        error: "Model did not return valid JSON.",
        raw: text,
      });
    }

    res.json(parsed);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? String(e) });
  }
});

const PORT = Number(process.env.PORT || 8787);
app.listen(PORT, () => {
  console.log(`Gemini codegen API running on http://localhost:${PORT}`);
});
