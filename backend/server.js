const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tours", require("./routes/tourRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/subscribers", require("./routes/subscriberRoutes"));

app.get("/", (req, res) => {
   res.send("Kashmir Yatra Backend Running");
});

mongoose
   .connect(process.env.MONGO_URI)
   .then(() => console.log("MongoDB connected"))
   .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});