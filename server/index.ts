import express from "express";
import cors from "cors";
import taskRoutes from "./routes/tasks";

const app = express();
const port = 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/tasks", taskRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
