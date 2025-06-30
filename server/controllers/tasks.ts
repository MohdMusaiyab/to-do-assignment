import { Request, Response } from "express";
import { Task, CreateTodoInput, UpdateTodoInput } from "../types";

//In Memory Task Store
let tasks: Task[] = [
  {
    id: "1",
    title: "Sample Task 1",
    completed: false,
  },
  {
    id: "2",
    title: "Sample Task 2",
    completed: true,
  },
  {
    id: "3",
    title: "Sample Task 3",
    completed: false,
  },
];
export const getTasks = (req: Request, res: Response): void => {
  
  try {
    res.json({
      message: "All Tasks Fetched Successfully",
      data: tasks,
      success: true,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", success: false });
    return;
  }
};

export const addTask = (req: Request, res: Response): void => {
  const { title, completed }: CreateTodoInput = req.body;
  if (!title) {
    res.status(400).json({ message: "Title is required", success: false });
    return;
  }
  const newTask: Task = {
    id: Date.now().toString(), 
    title,
    completed: completed || false, // Default to false if not provided
  };
  tasks.push(newTask);
  res.status(201).json({
    message: "Task added successfully",
    success: true,
    data: newTask,
  });
  return;
};

export const updateTask = (req: Request, res: Response): void => {
  const taskId: string = req.params.id;
  const updatedTask: UpdateTodoInput = req.body;
  try {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      res.status(404).json({ message: "Task not found", success: false });
      return;
    }
    const existingTask = tasks[taskIndex];
    const newTask: Task = {
      ...existingTask,
      ...updatedTask,
    };
    tasks[taskIndex] = newTask;
    res.json({
      message: "Task updated successfully",
      success: true,
      data: newTask,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error updating task", success: false });
    return;
  }
};

export const deleteTask = (req: Request, res: Response): void => {
  const taskId: string = req.params.id;
  try {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      res.status(404).json({ message: "Task not found", success: false });
      return;
    }
    tasks.splice(taskIndex, 1);
    res.json({
      message: "Task deleted successfully",
      success: true,
      data: taskId,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", success: false });
    return;
  }
};
