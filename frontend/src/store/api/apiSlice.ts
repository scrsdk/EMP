import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const api = createApi({
  baseQuery,
  tagTypes: ['User', 'District', 'Building', 'Guild', 'Resources'],
  endpoints: (builder) => ({
    // Auth endpoints
    loginWithTelegram: builder.mutation({
      query: (initData) => ({
        url: '/auth/telegram',
        method: 'POST',
        body: { init_data: initData },
      }),
    }),
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refresh_token: refreshToken },
      }),
    }),
    logout: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/logout',
        method: 'POST',
        body: { refresh_token: refreshToken },
      }),
    }),

    // User endpoints
    getCurrentUser: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateCurrentUser: builder.mutation({
      query: (data) => ({
        url: '/users/me',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getUserStats: builder.query({
      query: () => '/users/me/stats',
    }),
    connectWallet: builder.mutation({
      query: (walletAddress) => ({
        url: '/users/me/wallet',
        method: 'POST',
        body: { wallet_address: walletAddress },
      }),
      invalidatesTags: ['User'],
    }),
    getLeaderboard: builder.query({
      query: (limit = 50) => `/users/leaderboard?limit=${limit}`,
    }),

    // Game endpoints
    getMyDistrict: builder.query({
      query: () => '/game/districts/mine',
      providesTags: ['District', 'Resources'],
    }),
    getDistrictBuildings: builder.query({
      query: (districtId) => `/game/districts/${districtId}/buildings`,
      providesTags: ['Building'],
    }),
    createBuilding: builder.mutation({
      query: (data) => ({
        url: '/game/districts/buildings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Building', 'Resources'],
    }),
    upgradeBuilding: builder.mutation({
      query: (buildingId) => ({
        url: `/game/districts/buildings/${buildingId}/upgrade`,
        method: 'PUT',
      }),
      invalidatesTags: ['Building', 'Resources'],
    }),
    collectResources: builder.mutation({
      query: () => ({
        url: '/game/districts/collect',
        method: 'POST',
      }),
      invalidatesTags: ['Resources'],
    }),

    // Guild endpoints
    getGuilds: builder.query({
      query: () => '/game/guilds',
      providesTags: ['Guild'],
    }),
    createGuild: builder.mutation({
      query: (data) => ({
        url: '/game/guilds',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Guild', 'User'],
    }),
    getGuild: builder.query({
      query: (guildId) => `/game/guilds/${guildId}`,
      providesTags: ['Guild'],
    }),
    joinGuild: builder.mutation({
      query: (guildId) => ({
        url: `/game/guilds/${guildId}/join`,
        method: 'POST',
      }),
      invalidatesTags: ['Guild', 'User'],
    }),
    leaveGuild: builder.mutation({
      query: () => ({
        url: '/game/guilds/leave',
        method: 'POST',
      }),
      invalidatesTags: ['Guild', 'User'],
    }),
  }),
})

export const {
  useLoginWithTelegramMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useGetUserStatsQuery,
  useConnectWalletMutation,
  useGetLeaderboardQuery,
  useGetMyDistrictQuery,
  useGetDistrictBuildingsQuery,
  useCreateBuildingMutation,
  useUpgradeBuildingMutation,
  useCollectResourcesMutation,
  useGetGuildsQuery,
  useCreateGuildMutation,
  useGetGuildQuery,
  useJoinGuildMutation,
  useLeaveGuildMutation,
} = api