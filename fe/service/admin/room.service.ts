'use client'

import { useQuery } from '@tanstack/react-query'
import { axiosGeneral as axios } from '@/common/axios'

// Interfaces
export interface RoomData {
	uuid: string
	code: string
	name: string
	openTime: string
	closeTime: string
	createdBy: string
	createdAt: string
	updatedAt: string
}

export interface RoomsResponse {
	success: boolean
	code: number
	message: string
	error?: string
	data: RoomData[]
}

export interface Participant {
	studentId: string
	studentFullName: string
	studentEmail: string
	joinedAt?: string
}

export interface ParticipantsResponse {
	success: boolean
	code: number
	message: string
	data: {
		roomId: string
		roomName: string
		participants: Participant[]
	}
}

// Hooks
export function useGetAdminRooms() {
	return useQuery({
		queryKey: ['admin', 'rooms'],
		queryFn: async () => {
			const { data } = await axios.get<RoomsResponse>('/admin/rooms/getAll')
			return data
		},
		staleTime: 2 * 60 * 1000 // 2 minutes
	})
}

export function useGetRoomParticipants(roomId: string) {
	return useQuery({
		queryKey: ['admin', 'room', roomId, 'participants'],
		queryFn: async () => {
			const { data } = await axios.get<ParticipantsResponse>(
				`/admin/room/${roomId}/participants`
			)
			return data
		},
		enabled: !!roomId,
		staleTime: 1 * 60 * 1000 // 1 minute
	})
}

