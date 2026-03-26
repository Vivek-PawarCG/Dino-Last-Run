import { geminiClient } from '../services/geminiClient';

describe('geminiClient Google Services integration API', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ obstacleSpacingMultiplier: 1.1, speedScalingRate: 1.05 })
      })
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('safely fetches adaptive difficulty tuning sequences from the AI edge endpoints', async () => {
    const pastScores = [1200, 1500, 1300];
    const data = await geminiClient.getAdaptiveDifficulty(pastScores);
    
    expect(global.fetch).toHaveBeenCalledWith('/api/gemini/difficulty', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pastScores })
    }));
    
    expect(data.obstacleSpacingMultiplier).toBe(1.1);
  });
});
