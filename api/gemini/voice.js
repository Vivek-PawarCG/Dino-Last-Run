import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { biome, score, nearMiss, skillLevel } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const prompt = `You are Rex, the last T-Rex alive. You are sprinting from extinction.
    You are sardonic, surprisingly philosophical, and occasionally dramatic.
    You speak in 1-2 sentences MAX. No emojis. Current biome: ${biome}.
    Current score: ${Math.floor(score)}. Near miss: ${nearMiss}. Player skill: ${skillLevel}.
    Respond in character. Vary your tone. Never repeat the same line twice.`;

    // Setting chunked headers for streaming down from standard Node.js serverless functions
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    const responseStream = await model.generateContentStream(prompt);
    
    for await (const chunk of responseStream.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(chunkText);
      }
    }
    res.end();
  } catch (error) {
    console.error("Gemini Error:", error);
    res.write("...");
    res.end();
  }
}
