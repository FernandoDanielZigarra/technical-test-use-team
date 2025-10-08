import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithTokenHandling } from '~/api/baseQuery';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithTokenHandling,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    deleteAccount: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/users/me',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetCurrentUserQuery, useDeleteAccountMutation } = userApi;
