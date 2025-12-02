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
	roomId: string
	code: string
	join_at: Date | string
}

export interface JoinRoomResponse {
	name: string
	open_time: Date | string
	close_time: Date | string
	currentTime: Date | string // Server time để sync
	created_by: string // accountId
	created_at: Date | string
}

