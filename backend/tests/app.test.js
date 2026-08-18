const request = require('supertest');
const { app } = require('../server');

describe('Beauty Hub API', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('should return 404 for unknown route', async () => {
    const response = await request(app).get('/api/does-not-exist');
    expect(response.status).toBe(404);
  });
});
