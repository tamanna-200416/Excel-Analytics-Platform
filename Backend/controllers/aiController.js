import dotenv from "dotenv";
import xlsx from "xlsx";
import fetch from "node-fetch";
import { askGroq } from "../utils/groqClient.js";

dotenv.config();

export const getAISummary = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl || (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://"))) {
      return res.status(400).json({ success: false, message: "Invalid or missing file URL" });
    }

    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const textData = jsonData
      .filter((row) => row.length > 0)
      .map((row) => row.join(" | "))
      .join("\n")
      .slice(0, 15000);

    const prompt = `Please analyze and summarize the following spreadsheet data. Provide key insights, trends, and statistics:\n\n${textData}`;

    const summary = await askGroq(prompt);
    return res.status(200).json({ success: true, summary });
  } catch (err) {
    console.error("🔥 Groq error:", err);
    return res.status(500).json({ success: false, message: "AI summary failed", error: err.message });
  }
};

export const chatWithAI = async (req, res) => {
  try {
    const { fileUrl, question } = req.body;

    if (!fileUrl || !question) {
      return res.status(400).json({ success: false, message: "Missing fileUrl or question" });
    }

    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const textData = jsonData
      .filter((row) => row.length > 0)
      .map((row) => row.join(" | "))
      .join("\n")
      .slice(0, 15000);

    const prompt = `Based on the following spreadsheet data, please answer the user's question.\n\nSpreadsheet Data:\n${textData}\n\nUser Question: ${question}`;

    const answer = await askGroq(prompt);
    return res.status(200).json({ success: true, answer });
  } catch (err) {
    console.error("🔥 Groq chat error:", err);
    return res.status(500).json({ success: false, message: "AI chat failed", error: err.message });
  }
};