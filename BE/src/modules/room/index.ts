import Elysia, { t } from 'elysia'
import { requireAdmin } from '../../middlewares/requireAdmin'
import { roomService } from './services'
import {
	RoomSchema,
	CreateRoomSchema,
	CreateRoomResponseSchema,
	UpdateRoomSchema,
	UpdateRoomResponseSchema
} from '../../common/dtos/room.dto'
import { ApiResponseSchema } from '../../common/dtos/response'

export const room = new Elysia({
	prefix: '/admin/rooms',
	tags: ['Admin - Rooms']
})
	.use(requireAdmin)

	// Create new exam room
	// - Room code is auto-generated (6 characters)
	// - openTime must be before closeTime
	.post('/create-room', roomService.createRoom, {
		detail: {
			summary: 'Create exam room',
			description: 'Create a new exam room. Room code is auto-generated. openTime must be before closeTime.'
		},
		body: CreateRoomSchema,
		response: {
			201: ApiResponseSchema(CreateRoomResponseSchema),
			400: ApiResponseSchema(t.Null()),
			409: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Get rooms owned by current admin
	.get('/', roomService.getRooms, {
		detail: { summary: 'Get my rooms', description: 'Get list of rooms created by current admin.' },
		response: {
			200: ApiResponseSchema(t.Array(RoomSchema)),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Get all rooms (admin only)
	.get('/getAll', roomService.getAllRooms, {
		detail: { summary: 'Get all rooms', description: 'Get list of all rooms in the system.' },
		response: {
			200: ApiResponseSchema(t.Array(RoomSchema)),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Get room by ID
	.get('/:id', roomService.getRoomById, {
		detail: { summary: 'Get room by ID', description: 'Get room details by UUID. Only owner can access.' },
		params: t.Object({ id: t.String() }),
		response: {
			200: ApiResponseSchema(RoomSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})

	// Update room (name, openTime, closeTime)
	// - All fields are optional
	// - openTime must be before closeTime
	.put('/update-room/:id', roomService.updateRoom, {
		detail: {
			summary: 'Update room',
			description: 'Update room details. All fields are optional. openTime must be before closeTime.'
		},
		params: t.Object({ id: t.String() }),
		body: UpdateRoomSchema,
		response: {
			200: ApiResponseSchema(UpdateRoomResponseSchema),
			400: ApiResponseSchema(t.Null()),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
