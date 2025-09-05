
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('../backend/src/routes/auth'); // in repo path, adjust when running
const app = express(); app.use(bodyParser.json()); app.use('/api/auth', authRoutes);

describe('Auth routes (smoke)', () => {
  it('signup missing fields returns 400', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: '' });
    expect(res.statusCode).toBe(400);
  });
});
