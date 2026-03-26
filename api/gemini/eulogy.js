import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { score, biome, nearMisses, obstacleType, seconds, highScore } = req.body;

    const prompt = `You are Rex, a T-Rex who just died in an endless runner game. Write your own eulogy in 3 sentences. Facts about this run:
    - Score: ${score}
    - Furthest biome reached: ${biome}
    - Number of near-misses: ${nearMisses}
    - Cause of death: ${obstacleType}
    - Time survived: ${seconds} seconds
    - Player's best score ever: ${highScore}
    Be specific to these facts. Be dramatic but funny. End with one piece of unsolicited life advice.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.status(200).json({ text: response.text() });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(200).json({ text: "I ran... until I couldn't. At least the meteor looks pretty. Keep jumping, kid." });
  }
}
