const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Password Hashing', () => {
  it('hashes and compares passwords correctly', async () => {
    const password = 'testpass123';
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    const match = await bcrypt.compare(password, hash);
    expect(match).toBe(true);
    const fail = await bcrypt.compare('wrongpass', hash);
    expect(fail).toBe(false);
  });
});

describe('JWT Creation & Verification', () => {
  it('creates and verifies JWTs', () => {
    const payload = { id: 'abc123' };
    const secret = 'testsecret';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    expect(typeof token).toBe('string');
    const decoded = jwt.verify(token, secret);
    expect(decoded.id).toBe(payload.id);
  });
});

describe('Mongoose User Model Validation', () => {
  it('requires username, password, and Email', () => {
    const user = new User();
    const err = user.validateSync();
    expect(err.errors.username).toBeDefined();
    expect(err.errors.password).toBeDefined();
    expect(err.errors.Email).toBeDefined();
  });

  it('validates a correct user', () => {
    const user = new User({
      username: 'unituser',
      password: 'unitpass',
      Email: 'unit@uni.edu'
    });
    const err = user.validateSync();
    expect(err).toBeUndefined();
  });
});
