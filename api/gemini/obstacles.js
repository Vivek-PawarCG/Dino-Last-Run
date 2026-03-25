import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { biome, speed, performance } = req.body;
    
    const prompt = `Generate a wave of 3-4 obstacles for a dinosaur endless runner.
    Current biome: ${biome}. Current speed level: ${speed} (1-10 scale).
    Player performance: ${performance}.
    Return ONLY a JSON array, no markdown delimiters:
    [{"type":"CACTUS","timing":800,"narrative":"A thorny reminder of the past."}]
    Types available for ${biome}: CACTUS, PTERODACTYL, LAVA, ICE.
    Make timing feel rhythmic - not random. Create patterns.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt
    });

    let text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(text);
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
