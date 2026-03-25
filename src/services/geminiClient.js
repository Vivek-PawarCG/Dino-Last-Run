// Frontend wrapper to securely call our Vercel Serverless functions

const API_BASE = '/api/gemini';

export const geminiClient = {
  async getAdaptiveDifficulty(pastScores) {
    try {
      const res = await fetch(`${API_BASE}/difficulty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pastScores })
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      return { obstacleSpacingMultiplier: 1.0, speedScalingRate: 1.0 };
    }
  },

  async getObstacleWave(biome, speed, performance) {
    const maxRetries = 2;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Client] Fetching obstacle wave (attempt ${attempt}/${maxRetries}):`, { biome, speed, performance });
        const res = await fetch(`${API_BASE}/obstacles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ biome, speed, performance })
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('[Client] Received obstacle wave:', data);
        return data;
      } catch (e) {
        console.warn(`[Client] Obstacle fetch attempt ${attempt} failed:`, e.message);
        lastError = e;
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    console.error('[Client] All obstacle fetch attempts failed:', lastError.message);
    return null; // Fallback to procedural default in useObstacles
  },

  async getEulogy(stats) {
    try {
      const res = await fetch(`${API_BASE}/eulogy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      return data.text;
    } catch (e) {
      return "I ran... until I couldn't. At least the meteor looks pretty.";
    }
  },

  async getJournalEntry(stats) {
    try {
      const res = await fetch(`${API_BASE}/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      return data.text;
    } catch (e) {
      return "Another day, another run. I'm getting tired.";
    }
  },

  async streamVoiceLine(context, onToken, onComplete) {
    try {
      const res = await fetch(`${API_BASE}/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        onToken(chunk);
      }
      onComplete();
    } catch (e) {
      onToken("Wait... my connection to the AI hive mind is severed.");
      onComplete();
    }
  }
};
