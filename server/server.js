require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const mongoose = require("mongoose");

mongoose.set("debug", true);

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/auth", require("./routes/auth"));

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use('/api/profile', require('./routes/profile'));

app.use("/api/messages", require("./routes/messages"));

app.use("/api/match", require("./routes/match"));



const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));