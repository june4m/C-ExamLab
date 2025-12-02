// Room interfaces

export interface Room {
	roomId: string
	roomName: string
	creatorName: string
	creatorEmail: string
	openTime: string
	openDate: string
	closeTime: string
	closeDate: string
}

export interface RoomCardProps extends Room {
	className?: string
}

// API interfaces for rooms
export interface RoomRequest {
	roomName: string
	openTime: string
	openDate: string
	closeTime: string
	closeDate: string
}

export interface RoomResponse extends Room {
	id: string
	createdAt?: string
	updatedAt?: string
}

