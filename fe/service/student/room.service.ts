'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'
import type {
	RoomListResponse,
	JoinRoomRequest,
	JoinRoomResponse
} from '@/interface/student/room.interface'

export function useGetRooms() {
	return useQuery({
		queryKey: ['student', 'rooms'],
		queryFn: async () => {
			const { data } = await axios.get<RoomListResponse>('/student/rooms')
			return data
		},
		staleTime: 1 * 60 * 1000, // 1 minute - rooms may change frequently
	})
}

export function useJoinRoom() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (payload: JoinRoomRequest) => {
			const { data } = await axios.post<JoinRoomResponse>(
				'/student/rooms/join',
				payload
			)
			return data
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
			const { data: roomsData } = await axios.get<RoomListResponse>(
				'/student/rooms'
			)
			const room = roomsData.roomList.find(
				(r) => r.roomId === roomId
			)

			if (!room) {
				throw new Error('Room not found')
			}

			return room
		},
		enabled: !!roomId,
		staleTime: 1 * 60 * 1000 // 1 minute
	})
}

