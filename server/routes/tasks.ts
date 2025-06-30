import express from "express";
import {
  addTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../controllers/tasks";

const taskRoutes = express.Router();

//Route to Get All Tasks
taskRoutes.get("/", getTasks);

//Route to Add a New Task
taskRoutes.post("/", addTask);

//Route to Update a Task
taskRoutes.put("/:id", updateTask);

//Route to Delete a Task
taskRoutes.delete("/:id", deleteTask);

export default taskRoutes;
