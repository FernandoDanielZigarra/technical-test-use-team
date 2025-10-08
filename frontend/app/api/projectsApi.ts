import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '~/middleware/auth';
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  CreateColumnDto,
  UpdateColumnDto,
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  AddParticipantDto,
  Column,
  Task,
  ProjectParticipant,
} from '~/interfaces/projects';

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000',
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Project', 'Column', 'Task', 'Participant'],
  endpoints: (builder) => ({
    
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProject: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, CreateProjectDto>({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newProject } = await queryFulfilled;
          
          dispatch(
            projectsApi.util.updateQueryData('getProjects', undefined, (draft) => {
              draft.push(newProject);
            })
          );
        } catch {
          
        }
      },
    }),
    updateProject: builder.mutation<Project, { id: string; data: UpdateProjectDto }>({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        
        const patchResult = dispatch(
          projectsApi.util.updateQueryData('getProjects', undefined, (draft) => {
            return draft.filter((project) => project.id !== id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          
          patchResult.undo();
        }
      },
    }),

    addParticipant: builder.mutation<ProjectParticipant, { projectId: string; data: AddParticipantDto }>({
      query: ({ projectId, data }) => ({
        url: `/projects/${projectId}/participants`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
        'Participant',
      ],
    }),
    removeParticipant: builder.mutation<void, { projectId: string; participantId: string }>({
      query: ({ projectId, participantId }) => ({
        url: `/projects/${projectId}/participants/${participantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
        'Participant',
      ],
    }),
    leaveProject: builder.mutation<{ message: string }, { projectId: string; newOwnerId?: string }>({
      query: ({ projectId, newOwnerId }) => ({
        url: `/projects/${projectId}/leave`,
        method: 'POST',
        body: newOwnerId ? { newOwnerId } : {},
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
        'Project',
        'Participant',
      ],
    }),
    updateParticipantRole: builder.mutation<ProjectParticipant, { projectId: string; participantId: string; role: string }>({
      query: ({ projectId, participantId, role }) => ({
        url: `/projects/${projectId}/participants/${participantId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
        'Participant',
      ],
    }),

    getColumns: builder.query<Column[], string>({
      query: (projectId) => `/columns/project/${projectId}`,
      providesTags: ['Column'],
    }),
    createColumn: builder.mutation<Column, CreateColumnDto>({
      query: (data) => ({
        url: '/columns',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Column'],
    }),
    updateColumn: builder.mutation<Column, { id: string; data: UpdateColumnDto }>({
      query: ({ id, data }) => ({
        url: `/columns/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Column'],
    }),
    updateColumnOrder: builder.mutation<Column, { id: string; newOrder: number }>({
      query: ({ id, newOrder }) => ({
        url: `/columns/${id}/order`,
        method: 'PATCH',
        body: { newOrder },
      }),
      invalidatesTags: ['Column'],
    }),
    deleteColumn: builder.mutation<void, string>({
      query: (id) => ({
        url: `/columns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Column', 'Task'],
    }),

    getTasks: builder.query<Task[], string>({
      query: (columnId) => `/tasks/column/${columnId}`,
      providesTags: ['Task'],
    }),
    getTask: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation<Task, { columnId: string; data: CreateTaskDto }>({
      query: ({ columnId, data }) => ({
        url: `/tasks/column/${columnId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation<Task, { id: string; data: UpdateTaskDto }>({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Task', id }],
    }),
    moveTask: builder.mutation<Task, { id: string; data: MoveTaskDto }>({
      query: ({ id, data }) => ({
        url: `/tasks/${id}/move`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Task', 'Column'],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),

    exportBacklog: builder.mutation<{ success: boolean; message: string; tasksCount: number; email: string },{ projectId: string; email: string }>({
      query: ({ projectId, email }) => ({
        url: `/projects/${projectId}/export-backlog`,
        method: 'POST',
        body: { email },
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddParticipantMutation,
  useRemoveParticipantMutation,
  useLeaveProjectMutation,
  useUpdateParticipantRoleMutation,
  useGetColumnsQuery,
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useUpdateColumnOrderMutation,
  useDeleteColumnMutation,
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useMoveTaskMutation,
  useDeleteTaskMutation,
  useExportBacklogMutation,
} = projectsApi;
