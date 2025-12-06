// Jest + Supertest review submission tests
const request = require('supertest');
const app = require('./server');
const mongoose = require('mongoose');

const {
  TEST_BUSINESS_EMAIL,
  TEST_BUSINESS_PASSWORD,
  TEST_TARGET_FREELANCER_USERID,
} = process.env;

const loginBusiness = async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_BUSINESS_EMAIL, password: TEST_BUSINESS_PASSWORD });
  return res.body?.token;
};

describe('Reviews', () => {
  let bizToken;

  beforeAll(async () => {
    if (!TEST_BUSINESS_EMAIL || !TEST_BUSINESS_PASSWORD || !TEST_TARGET_FREELANCER_USERID) {
      throw new Error('Missing TEST_* env vars for reviews');
    }
    bizToken = await loginBusiness();
    if (!bizToken) throw new Error('Business login failed');
  });

  test('accepts valid rating', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${bizToken}`)
      .send({ targetType: 'freelancer', targetUserId: TEST_TARGET_FREELANCER_USERID, rating: 5, comment: 'Great work' });

    expect(res.statusCode).toBe(201);
  });

  test('rejects rating > 5', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${bizToken}`)
      .send({ targetType: 'freelancer', targetUserId: TEST_TARGET_FREELANCER_USERID, rating: 6, comment: 'Too high' });

    expect(res.statusCode).toBe(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
