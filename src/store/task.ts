import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type Task = {
  id: string;
  content: string;
  isCompleted: boolean;
};

interface TaskState {
  title: string;
  review: string;
  tasks: Task[];
  actions: {
    updateTitle: (title: string) => void;
    updateReview: (review: string) => void;
    toggleDone: (id: string) => void;
    addTask: (content: string) => void;
    updateTaskContent: (updateId: string, content: string) => void;
    deletedTask: (deletedId: string) => void;
  };
}

export const useTaskStore = create<TaskState>((set, get) => ({
  title: '',
  review: '',
  tasks: [],
  actions: {
    updateTitle: (title) => {
      set(() => ({
        title,
      }));
    },
    updateReview: (review) => {
      set(() => ({
        review,
      }));
    },
    toggleDone: (id) => {
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        ),
      }));
    },
    addTask: (content) => {
      set((state) => ({
        tasks: [
          {
            id: nanoid(),
            content,
            isCompleted: false,
          },
          ...state.tasks,
        ],
      }));
    },
    updateTaskContent: (id, content) => {
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, content, id } : task
        ),
      }));
    },
    deletedTask: (id) => {
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
    },
  },
}));

export const useTaskTitle = () => useTaskStore((state) => state.title);
export const useTaskReview = () => useTaskStore((state) => state.review);
export const useTasks = () => useTaskStore((state) => state.tasks);
export const useTaskActions = () => useTaskStore((state) => state.actions);
