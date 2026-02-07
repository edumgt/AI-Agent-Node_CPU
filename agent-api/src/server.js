const express = require("express");
const cors = require("cors");
const path = require("path");

const chatRoutes = require("./routes/chat");

const app = express();
app.set("trust proxy", true);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ✅ 정적 서빙: 프로젝트 루트의 /web 폴더를 /web 경로로 노출
app.use("/web", express.static(path.join(__dirname, "../../web")));

// (선택) 루트 접속 시 FE로 이동
app.get("/", (req, res) => res.redirect("/web/index.html"));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api", chatRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(JSON.stringify({ level: "info", msg: "listening", port }));
});
