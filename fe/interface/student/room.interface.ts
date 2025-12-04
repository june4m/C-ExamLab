// Student Room interfaces

export interface Room {
	roomId: string
	name: string
	open_time: Date | string
	close_time: Date | string
}

export interface RoomListResponse {
	roomList: Room[]
}

export interface JoinRoomRequest {
	roomCode: string // 6 character room code
}

export interface JoinRoomResponse {
	message: string
	roomId: string
	roomName: string
	openTime: string | null
	closeTime: string | null
}

