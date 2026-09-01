import app from "./app.js";
import env from "./config/env.js";
import connectDB from "./config/database.js";

// Connect to MongoDB
connectDB();

// Start the server
const PORT = env.port || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});