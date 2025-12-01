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
	.post('/create-room', roomService.createRoom, {
		body: CreateRoomSchema,
		response: {
			201: ApiResponseSchema(CreateRoomResponseSchema),
			409: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
	.get('/', roomService.getRooms, {
		response: {
			200: ApiResponseSchema(t.Array(RoomSchema)),
			500: ApiResponseSchema(t.Null())
		}
	})
	.get('/getAll', roomService.getAllRooms, {
		response: {
			200: ApiResponseSchema(t.Array(RoomSchema)),
			500: ApiResponseSchema(t.Null())
		}
	})
	.get('/:id', roomService.getRoomById, {
		params: t.Object({ id: t.String() }),
		response: {
			200: ApiResponseSchema(RoomSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
	.put('/update-room/:id', roomService.updateRoom, {
		params: t.Object({ id: t.String() }),
		body: UpdateRoomSchema,
		response: {
			200: ApiResponseSchema(UpdateRoomResponseSchema),
			403: ApiResponseSchema(t.Null()),
			404: ApiResponseSchema(t.Null()),
			500: ApiResponseSchema(t.Null())
		}
	})
