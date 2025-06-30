'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', 
});

const Page = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/tasks');
      
      const tasksData = Array.isArray(response.data.data) ? response.data.data : [];
      setTasks(tasksData);
      setFilteredTasks(tasksData);
    } catch (error) {
      toast.error('Failed to fetch tasks');
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Safely filter tasks
    const filtered = Array.isArray(tasks) 
      ? tasks.filter(task =>
          task.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
    setFilteredTasks(filtered);
  }, [searchQuery, tasks]);

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const response = await api.post('/tasks', {
        title: newTaskTitle,
        completed: false
      });
      
      const newTask = response.data.data;
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      toast.success('Task added successfully');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId: string) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;

      const response = await api.put(`/tasks/${taskId}`, {
        completed: !taskToUpdate.completed
      });

      // Backend returns { message, success, data } - extract the data (updated task)
      const updatedTask = response.data.data;
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  // Drag and drop
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(filteredTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFilteredTasks(items);
    
    // Update the main tasks array to reflect the new order
    setTasks(items);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-4 sm:py-8 px-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300 to-indigo-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative max-w-md sm:max-w-lg lg:max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Task Manager
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Organize your day, achieve your goals</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Add Task Form */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 placeholder-gray-500"
                  />
                </div>
                <button
                  onClick={addTask}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 whitespace-nowrap"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Task
                  </span>
                </button>
              </div>
            </div>

            {/* Task List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 animate-spin">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Loading your tasks...</p>
              </div>
            ) : (
              <>
                {Array.isArray(filteredTasks) && filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium mb-2">
                      {searchQuery ? 'No matching tasks found' : 'No tasks yet'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {searchQuery ? 'Try a different search term' : 'Add your first task to get started!'}
                    </p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="tasks">
                      {(provided) => (
                        <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef}
                          className="space-y-3"
                        >
                          {Array.isArray(filteredTasks) && filteredTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`group relative p-4 rounded-xl border transition-all duration-200 ${
                                    snapshot.isDragging 
                                      ? 'shadow-2xl bg-white border-purple-200 scale-105' 
                                      : task.completed 
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50 shadow-sm' 
                                        : 'bg-white border-gray-200/50 shadow-sm hover:shadow-md hover:border-purple-200/50'
                                  }`}
                                >
                                  {/* Drag handle indicator */}
                                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity">
                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 10h2v2H8v-2zm6 0h2v2h-2v-2zM8 14h2v2H8v-2zm6 0h2v2h-2v-2z"/>
                                    </svg>
                                  </div>

                                  <div className="flex items-center justify-between ml-4">
                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          checked={task.completed}
                                          onChange={() => toggleTask(task.id)}
                                          className="h-5 w-5 rounded border-2 border-gray-300 text-purple-500 focus:ring-purple-500/20 focus:ring-2 transition-all duration-200 cursor-pointer"
                                        />
                                        {task.completed && (
                                          <svg className="absolute inset-0 w-5 h-5 text-green-500 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                          </svg>
                                        )}
                                      </div>
                                      <span className={`flex-1 font-medium transition-all duration-200 ${
                                        task.completed 
                                          ? 'line-through text-green-600/70' 
                                          : 'text-gray-800'
                                      }`}>
                                        {task.title}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => deleteTask(task.id)}
                                      className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </>
            )}
          </div>

          {/* Stats Footer */}
          {Array.isArray(filteredTasks) && filteredTasks.length > 0 && (
            <div className="px-6 sm:px-8 py-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-t border-gray-200/30">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {filteredTasks.filter(task => task.completed).length} of {filteredTasks.length} completed
                </span>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, filteredTasks.length) }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full ${
                        i < filteredTasks.filter(task => task.completed).length 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;