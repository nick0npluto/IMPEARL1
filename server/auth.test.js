// Jest + Supertest login tests
const request = require('supertest');
const app = require('./server');
const mongoose = require('mongoose');

const { TEST_BUSINESS_EMAIL, TEST_BUSINESS_PASSWORD } = process.env;

const maybe = (name, fn) => {
  if (!TEST_BUSINESS_EMAIL || !TEST_BUSINESS_PASSWORD) {
    return test.skip(`${name} (set TEST_BUSINESS_EMAIL/PASSWORD to run)`, () => {});
  }
  return test(name, fn);
};

describe('Auth login', () => {
  maybe('login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_BUSINESS_EMAIL, password: TEST_BUSINESS_PASSWORD });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user.userType');
  });

  maybe('login fails with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_BUSINESS_EMAIL, password: 'WrongPassword!' });

    expect([401, 403]).toContain(res.statusCode);
  });

  test('login fails with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'anything' });

    expect([400, 401, 403]).toContain(res.statusCode);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
