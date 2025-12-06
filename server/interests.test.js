// Jest + Supertest collaboration interest tests
const request = require('supertest');
const app = require('./server');
const mongoose = require('mongoose');

const {
  TEST_FREELANCER_EMAIL,
  TEST_FREELANCER_PASSWORD,
  TEST_BUSINESS_TARGET_ID,
} = process.env;

const loginFreelancer = async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_FREELANCER_EMAIL, password: TEST_FREELANCER_PASSWORD });
  return res.body?.token;
};

describe('Collaboration interests', () => {
  let freelancerToken;

  beforeAll(async () => {
    if (!TEST_FREELANCER_EMAIL || !TEST_FREELANCER_PASSWORD || !TEST_BUSINESS_TARGET_ID) {
      throw new Error('Missing TEST_* env vars for interests');
    }
    freelancerToken = await loginFreelancer();
    if (!freelancerToken) throw new Error('Freelancer login failed');
  });

  test('sends interest to business', async () => {
    const res = await request(app)
      .post('/api/matches/request')
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({ businessId: TEST_BUSINESS_TARGET_ID, note: 'Interested in collaborating' });

    expect([200, 201]).toContain(res.statusCode);
  });

  test('rejects missing businessId', async () => {
    const res = await request(app)
      .post('/api/matches/request')
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({ note: 'Missing business id' });

    expect(res.statusCode).toBe(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
