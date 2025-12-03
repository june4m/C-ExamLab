'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	RoomListResponse,
	JoinRoomRequest,
	JoinRoomResponse
} from '@/interface/student/room.interface'

// ApiResponse wrapper type matching backend
interface ApiResponse<T> {
	success: boolean
	message?: string
	error?: string
	code: number
	data?: T
}

export function useGetRooms() {
	return useQuery({
		queryKey: ['student', 'rooms'],
		queryFn: async () => {
			const { data } = await axios.get<ApiResponse<RoomListResponse>>(
				'/user/student/rooms'
			)
			if (!data.success || !data.data) {
				throw new Error(data.error || data.message || 'Failed to fetch rooms')
			}
			return data.data
		},
		staleTime: 1 * 60 * 1000 // 1 minute - rooms may change frequently
	})
}

export function useJoinRoom() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: JoinRoomRequest): Promise<JoinRoomResponse> => {
			const { data } = await axios.post<ApiResponse<JoinRoomResponse>>(
				'/user/join-room',
				payload
			)
			if (!data.success || !data.data) {
				throw new Error(data.error || data.message || 'Failed to join room')
			}
			return data.data
		},
		onSuccess: () => {
			// Invalidate rooms list to refresh after joining
			queryClient.invalidateQueries({ queryKey: ['student', 'rooms'] })
		}
	})
}

export function useGetRoomDetails(roomId: string) {
	return useQuery({
		queryKey: ['student', 'rooms', roomId, 'details'],
		queryFn: async () => {
			// Try to get room from the rooms list
			const { data: response } = await axios.get<ApiResponse<RoomListResponse>>(
				'/user/student/rooms'
			)
			if (!response.success || !response.data) {
				throw new Error(
					response.error || response.message || 'Failed to fetch rooms'
				)
			}
			const room = response.data.roomList.find(r => r.roomId === roomId)

			if (!room) {
				throw new Error('Room not found')
			}

			return room
		},
		enabled: !!roomId,
		staleTime: 1 * 60 * 1000 // 1 minute
	})
}
