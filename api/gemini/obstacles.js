import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    console.log('[GEMINI API] Obstacle request:', { biome: req.body.biome, speed: req.body.speed, performance: req.body.performance });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { biome, speed, performance } = req.body;
    
    // Define biome-specific obstacle types
    const biomeConfigs = {
      'BADLANDS': {
        obstacles: ['CACTUS'],
        description: 'desert wasteland with cacti and rocks'
      },
      'JUNGLE': {
        obstacles: ['TREE'],
        description: 'dense jungle with trees and wildlife'
      },
      'VOLCANIC': {
        obstacles: ['LAVA_ROCK'],
        description: 'volcanic landscape with lava and fire hazards'
      },
      'TUNDRA': {
        obstacles: ['ICE_SPIKE'],
        description: 'frozen tundra with ice formations'
      },
      'FINAL RUN': {
        obstacles: ['ASTEROID'],
        description: 'cosmic realm with celestial hazards'
      }
    };

    const biomeConfig = biomeConfigs[biome.toUpperCase()] || biomeConfigs['BADLANDS'];
    
    const prompt = `Generate a wave of 3-5 obstacles for a dinosaur endless runner game.
    Current biome: ${biome} (${biomeConfig.description})
    Current speed level: ${speed} (1-10 scale).
    Player performance: ${performance}.
    
    Available obstacle types for this biome: ${biomeConfig.obstacles.join(', ')}
    
    Return ONLY a JSON array with biome-appropriate obstacles:
    [
      {
        "type": "CACTUS",
        "timing": 800,
        "narrative": "A sharp cactus blocks your path in the desert.",
        "biome": "${biome}",
        "sprite": "cactus_large"
      }
    ]
    
    Make timing rhythmic and challenging. Include variety in obstacle types.
    Ensure obstacles fit the ${biome} biome theme.`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    console.log('[GEMINI API] Raw response:', text);

    let data;
    try {
      data = JSON.parse(text);
      console.log('[GEMINI API] Parsed obstacles:', data);

      // Optionally generate images for obstacles (if requested)
      if (req.body.generateImages) {
        console.log('[GEMINI API] Generating images for obstacles...');
        for (let i = 0; i < data.length; i++) {
          try {
            const obstacle = data[i];
            // Call image generation API
            const imageResponse = await fetch(`${req.protocol}://${req.get('host')}/api/gemini/images`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                obstacleType: obstacle.type,
                biome: biome,
                style: 'pixel-art'
              })
            });

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              if (imageData.success) {
                data[i].imageData = imageData.imageData;
                console.log(`[GEMINI API] Generated image for ${obstacle.type}`);
              }
            }
          } catch (imageError) {
            console.warn(`[GEMINI API] Failed to generate image for ${data[i].type}:`, imageError.message);
          }
        }
      }

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
