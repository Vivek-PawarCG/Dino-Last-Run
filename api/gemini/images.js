import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('[GEMINI IMAGE API] Image generation request:', req.body);

    // Validate required parameters
    const { obstacleType, biome } = req.body;
    if (!obstacleType || !biome) {
      return res.status(400).json({
        error: 'Missing required parameters: obstacleType and biome are required'
      });
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('[GEMINI IMAGE API] Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const style = req.body.style || 'pixel-art';

    // Create detailed prompt for obstacle image generation
    const imagePrompt = `Create a ${style} style sprite image of a ${obstacleType} obstacle for a dinosaur endless runner game.
    The obstacle should be in a ${biome} biome environment.
    Style: 32x32 pixel art, game sprite, suitable for side-scrolling runner game.
    The ${obstacleType} should look dangerous and fit the ${biome} theme.
    Background should be transparent, focus on the obstacle itself.
    Make it look retro/pixelated like classic arcade games.`;

    console.log('[GEMINI IMAGE API] Generating image with prompt:', imagePrompt);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const result = await model.generateContent({
      contents: [{
        parts: [
          { text: imagePrompt }
        ]
      }]
    });

    const response = await result.response;
    console.log('[GEMINI IMAGE API] Raw response structure:', JSON.stringify(response, null, 2));

    // Extract image data from response
    let imageData;
    try {
      // For Gemini image generation, the response structure may vary
      if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        const content = response.candidates[0].content;
        if (content.parts && content.parts[0] && content.parts[0].inlineData) {
          imageData = content.parts[0].inlineData;
        }
      }

      if (!imageData) {
        throw new Error('No image data found in response');
      }

      console.log('[GEMINI IMAGE API] Image generated successfully, mime type:', imageData.mimeType);

    } catch (parseError) {
      console.error('[GEMINI IMAGE API] Failed to parse image response:', parseError.message);
      throw new Error(`Image generation failed: ${parseError.message}`);
    }

    // Return base64 image data
    res.status(200).json({
      success: true,
      imageData: `data:${imageData.mimeType};base64,${imageData.data}`,
      obstacleType,
      biome,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("[GEMINI IMAGE API] Error:", error.message);

    // Return error response with appropriate status code
    res.status(500).json({
      success: false,
      error: error.message,
      obstacleType: req.body?.obstacleType,
      biome: req.body?.biome,
      fallback: true
    });
  }
}