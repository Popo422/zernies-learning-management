import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { User } from "@clerk/nextjs/server";
const customBaseQuery = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: any) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  });

  try {
    const result: any = await baseQuery(args, api, extraOptions);
    if (result.data) {
      result.data = result.data.data;
    }
    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return { error: { status: 500, data: { message: errorMessage } } };
  }
};

export const api = createApi({
  baseQuery: customBaseQuery,
  reducerPath: "api",
  tagTypes: ["Courses" , "Users"],
  endpoints: (build) => ({
    updateUser: build.mutation<User, Partial<User> & { userId: string }>({
      query: ({ userId, ...updatedUser }) => ({
        url: `users/clerk/${userId}`,
        method: "PUT",
        body: updatedUser,
      }),
      invalidatesTags: ["Users"],
    }),
    getCourses: build.query<Course[], { category?: string }>({
      query: ({ category }) => ({
        url: "courses",
        // localhost:8001/courses
        params: { category },
      }),
      // ur gonna save this data in Courses this is gonna be used in invalidation
      providesTags: ["Courses"],
    }),
    getCourse: build.query<Course, string>({
      query: (courseId) => ({
        url: `courses/${courseId}`,
      }),
      // this invalidates the providedTag
      providesTags: (result, error, id) => [{ type: "Courses", id }],
    }),
  }),
});

export const { useGetCoursesQuery, useGetCourseQuery, useUpdateUserMutation } = api;
