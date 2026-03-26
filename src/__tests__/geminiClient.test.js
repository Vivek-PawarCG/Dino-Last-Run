import { geminiClient } from '../services/geminiClient';

describe('geminiClient Google Services integration API', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ type: 'CACTUS', timing: 800 }])
      })
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('safely fetches procedural obstacle waves from the AI edge endpoints', async () => {
    const data = await geminiClient.getObstacleWave('BADLANDS', 5, 'thriving');
    
    expect(global.fetch).toHaveBeenCalledWith('/api/gemini/obstacles', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ biome: 'BADLANDS', speed: 5, performance: 'thriving' })
    }));
    
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].type).toBe('CACTUS');
  });
});
