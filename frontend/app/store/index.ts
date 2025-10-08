import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '~/api/authApi';
import { projectsApi } from '~/api/projectsApi';
import { userApi } from '~/api/userApi';
import projectReducer from './slices/projectSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    project: projectReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, projectsApi.middleware, userApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;