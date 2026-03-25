import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { pastScores } = req.body;
    
    const prompt = `Analyze these 3 scores from a dinosaur endless runner: ${pastScores.join(', ')}. 
    Suggest subtle difficulty adjustments as JSON:
    { 
      "obstacleSpacingMultiplier": float (0.8-1.3),
      "speedScalingRate": float (0.8-1.2)
    }
    Rules: never make it feel unfair. Return ONLY JSON, no markdown blocks.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    let text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(text);
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(200).json({ obstacleSpacingMultiplier: 1.0, speedScalingRate: 1.0 }); 
  }
}
