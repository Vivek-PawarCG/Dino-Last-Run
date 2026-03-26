import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { score, biome, nearMisses, obstacle } = req.body;
    
    const prompt = `Write a short journal entry (2-3 sentences) from the perspective of Rex the T-Rex after this run. Write in past tense, first person. Score: ${score}. Biome: ${biome}. Notable events: ${nearMisses} close calls. Death by: ${obstacle}. Tone: reflective, slightly melodramatic. Date it with a fictional 'Cretaceous timestamp' (e.g., '65,000,032 BC - Evening').`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.status(200).json({ text: response.text() });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(200).json({ text: "65,000,000 BC. Another day, another run. I'm getting tired." }); 
  }
}
