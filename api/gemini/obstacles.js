import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    console.log('[GEMINI API] Obstacle request:', { biome: req.body.biome, speed: req.body.speed, performance: req.body.performance });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { biome, speed, performance } = req.body;
    
    const prompt = `Generate a wave of 3-4 obstacles for a dinosaur endless runner.
    Current biome: ${biome}. Current speed level: ${speed} (1-10 scale).
    Player performance: ${performance}.
    Return ONLY a JSON array, no markdown delimiters:
    [{"type":"CACTUS","timing":800,"narrative":"A thorny reminder of the past."}]
    Types available for ${biome}: CACTUS, PTERODACTYL, LAVA, ICE.
    Make timing feel rhythmic - not random. Create patterns.`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    console.log('[GEMINI API] Raw response:', text);
    
    let data;
    try {
      data = JSON.parse(text);
      console.log('[GEMINI API] Parsed obstacles:', data);
    } catch (parseError) {
      console.error('[GEMINI API] JSON parse error:', parseError.message);
      console.error('[GEMINI API] Raw text that failed to parse:', text);
      // Fallback: generate a simple obstacle wave
      data = [
        { type: 'CACTUS', timing: 800, narrative: 'A cactus blocks your path.' }
      ];
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error("[GEMINI API] Error:", error.message);
    
    // Provide fallback obstacles instead of 500 error
    const fallbackObstacles = [
      { type: 'CACTUS', timing: 800, narrative: 'A cactus appears suddenly.' },
      { type: 'CACTUS', timing: 1200, narrative: 'Another hazard approaches.' }
    ];
    
    console.log('[GEMINI API] Returning fallback obstacles:', fallbackObstacles);
    res.status(200).json(fallbackObstacles);
  }
}
