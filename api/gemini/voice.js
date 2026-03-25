import { GoogleGenAI } from "@google/genai";

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { biome, score, nearMiss, skillLevel } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are Rex, the last T-Rex alive. You are sprinting from extinction.
    You are sardonic, surprisingly philosophical, and occasionally dramatic.
    You speak in 1-2 sentences MAX. No emojis. Current biome: ${biome}.
    Current score: ${score}. Near miss: ${nearMiss}. Player skill: ${skillLevel}.
    Respond in character. Vary your tone. Never repeat the same line twice.`;

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          controller.enqueue(new TextEncoder().encode(chunk.text));
        }
        controller.close();
      }
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (error) {
    console.error("Gemini Error:", error);
    return new Response("...", { status: 200 }); 
  }
}
