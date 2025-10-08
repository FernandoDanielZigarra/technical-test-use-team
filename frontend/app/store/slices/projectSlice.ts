import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Project, Column, Task, ProjectParticipant } from '~/interfaces/projects';

interface ProjectState {
  currentProject: Project | null;
  columns: Column[];
  isSocketConnected: boolean;
}

const initialState: ProjectState = {
  currentProject: null,
  columns: [],
  isSocketConnected: false,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload;
      state.columns = action.payload.columns || [];
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.columns = [];
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isSocketConnected = action.payload;
    },

    updateProject: (state, action: PayloadAction<Partial<Project>>) => {
      if (state.currentProject) {
        state.currentProject = { ...state.currentProject, ...action.payload };
      }
    },
    
    addColumn: (state, action: PayloadAction<Column>) => {
      const exists = state.columns.find(c => c.id === action.payload.id);
      if (!exists) {
        state.columns.push({ ...action.payload, tasks: [] });
        state.columns.sort((a, b) => a.order - b.order);
      }
    },
    
    updateColumn: (state, action: PayloadAction<Column>) => {
      const index = state.columns.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.columns[index] = { ...state.columns[index], ...action.payload };
        state.columns.sort((a, b) => a.order - b.order);
      }
    },
    
    removeColumn: (state, action: PayloadAction<string>) => {
      state.columns = state.columns.filter(c => c.id !== action.payload);
    },
    
    addTask: (state, action: PayloadAction<Task>) => {
      const column = state.columns.find(c => c.id === action.payload.columnId);
      if (column) {
        const exists = column.tasks.find(t => t.id === action.payload.id);
        if (!exists) {
          column.tasks.push(action.payload);
          column.tasks.sort((a, b) => a.order - b.order);
        }
      }
    },
    
    updateTask: (state, action: PayloadAction<Task>) => {
      const column = state.columns.find(c => c.id === action.payload.columnId);
      if (column) {
        const index = column.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          column.tasks[index] = action.payload;
        }
      }
    },
    
    moveTaskBetweenColumns: (state, action: PayloadAction<{
      taskId: string;
      sourceColumnId: string;
      targetColumnId: string;
      newOrder: number;
    }>) => {
      const { taskId, sourceColumnId, targetColumnId } = action.payload;
      
      const sourceColumn = state.columns.find(c => c.id === sourceColumnId);
      const targetColumn = state.columns.find(c => c.id === targetColumnId);
      
      if (sourceColumn && targetColumn) {
        const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          const [task] = sourceColumn.tasks.splice(taskIndex, 1);
          task.columnId = targetColumnId;
          task.order = action.payload.newOrder;
          targetColumn.tasks.push(task);
          targetColumn.tasks.sort((a, b) => a.order - b.order);
        }
      }
    },
    
    removeTask: (state, action: PayloadAction<string>) => {
      state.columns.forEach(column => {
        column.tasks = column.tasks.filter(t => t.id !== action.payload);
      });
    },
    
    addParticipant: (state, action: PayloadAction<ProjectParticipant>) => {
      if (state.currentProject) {
        const exists = state.currentProject.participants.find(p => p.id === action.payload.id);
        if (!exists) {
          state.currentProject.participants.push(action.payload);
        }
      }
    },
    
    removeParticipant: (state, action: PayloadAction<string>) => {
      if (state.currentProject) {
        state.currentProject.participants = state.currentProject.participants.filter(
          p => p.id !== action.payload
        );
      }
    },

    reorderTasksLocally: (state, action: PayloadAction<{
      columnId: string;
      tasks: Task[];
    }>) => {
      const column = state.columns.find(c => c.id === action.payload.columnId);
      if (column) {
        column.tasks = action.payload.tasks;
      }
    },
  },
});

export const {
  setCurrentProject,
  clearCurrentProject,
  setSocketConnected,
  updateProject,
  addColumn,
  updateColumn,
  removeColumn,
  addTask,
  updateTask,
  moveTaskBetweenColumns,
  removeTask,
  addParticipant,
  removeParticipant,
  reorderTasksLocally,
} = projectSlice.actions;

export default projectSlice.reducer;
