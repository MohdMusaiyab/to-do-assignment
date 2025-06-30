export type Task = {
    id: string;
    title: string;
    completed: boolean;
  };
  
  export type CreateTodoInput = Omit<Task, 'id' | 'completed'> & {
    completed?: boolean;
  };
  
  export type UpdateTodoInput = Partial<CreateTodoInput>;