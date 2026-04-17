const request = require("supertest");
const app = require("../server");
const User = require("../models/User");
const mongoose = require("mongoose");

describe("Auth Integration", () => {

  it("register + login flow works (with manual verification)", async () => {
    const id = Math.floor(Math.random() * 100000);
    const user = {
      username: `int_${id}`,
      password: "integrationPass123",
      email: `int_${id}@uni.edu`
    };

    // Register
    const reg = await request(app)
      .post("/auth/register")
      .send(user);

    expect(reg.statusCode).toBeLessThan(500);

    // Mark user as verified
    await User.updateOne({ username: user.username }, { isVerified: true });

    // Login
    const login = await request(app)
      .post("/auth/login")
      .send({ username: user.username, password: user.password });

    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeDefined();
    expect(login.body.user.username).toBe(user.username);
  });

});

afterAll(async () => {
  await mongoose.connection.close();
});
