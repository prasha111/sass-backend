import User from "./models/User.js";

app.get("/test-user", async (req, res) => {
  try {
    const user = await User.create({
      name: "Prashant",
      email: "prashant@example.com",
      passwordHash: "dummy123"
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});