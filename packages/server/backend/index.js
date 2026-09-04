import app from "./app.js";
import env from "./config/env.js";
import connectDB from "./config/database.js";

// Connect to MongoDB
connectDB();

// Start the server
const PORT = env.port || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});