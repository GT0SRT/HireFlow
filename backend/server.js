const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Backend API is running" });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/api/v1/echo", (req, res) => {
    const { text = "" } = req.body || {};
    res.json({
        received: true,
        length: String(text).length,
        preview: String(text).slice(0, 120),
    });
});

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
