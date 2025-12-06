// Jest + Supertest contract creation tests
const request = require('supertest');
const app = require('./server');
const mongoose = require('mongoose');

const {
  TEST_BUSINESS_EMAIL,
  TEST_BUSINESS_PASSWORD,
  TEST_PAYEE_WITH_PAYOUTS,
  TEST_PAYEE_NO_PAYOUTS,
  SKIP_CONTRACT_CREATION,
} = process.env;

const loginBusiness = async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_BUSINESS_EMAIL, password: TEST_BUSINESS_PASSWORD });
  return res.body?.token;
};

describe('Contracts', () => {
  let bizToken;

  beforeAll(async () => {
    if (SKIP_CONTRACT_CREATION === 'true') return;
    if (!TEST_BUSINESS_EMAIL || !TEST_BUSINESS_PASSWORD || !TEST_PAYEE_WITH_PAYOUTS || !TEST_PAYEE_NO_PAYOUTS) {
      throw new Error('Missing required TEST_* env vars');
    }
    bizToken = await loginBusiness();
    if (!bizToken) throw new Error('Business login failed');
  });

  test('creates contract when payee has payouts enabled', async () => {
    if (SKIP_CONTRACT_CREATION === 'true') return test.skip('Contract creation endpoint not available')();
    const res = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${bizToken}`)
      .send({ payeeId: TEST_PAYEE_WITH_PAYOUTS, amountUsd: 5000, title: 'Automation build' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('contract._id');
  });

  test('blocks contract when payee has no payouts', async () => {
    if (SKIP_CONTRACT_CREATION === 'true') return test.skip('Contract creation endpoint not available')();
    const res = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${bizToken}`)
      .send({ payeeId: TEST_PAYEE_NO_PAYOUTS, amountUsd: 5000, title: 'Automation build' });

    expect(res.statusCode).toBe(400);
    expect(String(res.text || '')).toMatch(/payout setup/i);
  });

  test('rejects invalid amount (<=0)', async () => {
    if (SKIP_CONTRACT_CREATION === 'true') return test.skip('Contract creation endpoint not available')();
    const res = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${bizToken}`)
      .send({ payeeId: TEST_PAYEE_WITH_PAYOUTS, amountUsd: 0, title: 'Bad amount' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
