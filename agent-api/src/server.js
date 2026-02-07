const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chat");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api", chatRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(JSON.stringify({ level: "info", msg: "listening", port }));
});
