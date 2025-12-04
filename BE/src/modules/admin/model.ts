import { t } from 'elysia'

// Schema for student response
export const StudentSchema = t.Object({
	studentId: t.String(),
	studentFullName: t.Union([t.String(), t.Null()]),
	studentEmail: t.String(),
	isBanned: t.Boolean(),
	lastLogin: t.Union([t.String(), t.Null()]),
	createdAt: t.Union([t.String(), t.Null()]),
	updatedAt: t.Union([t.String(), t.Null()])
})

export type Student = typeof StudentSchema.static

// Schema for update user request
export const UpdateUserSchema = t.Object({
	studentFullName: t.Optional(t.String()),
	studentEmail: t.Optional(t.String({ format: 'email' }))
})

export type UpdateUserDto = typeof UpdateUserSchema.static

// Schema for ban/unban response
export const BanResponseSchema = t.Object({
	message: t.String()
})

export type BanResponse = typeof BanResponseSchema.static

// Schema for leaderboard student (simplified)
export const LeaderboardStudentSchema = t.Object({
	studentId: t.String(),
	studentFullName: t.Union([t.String(), t.Null()]),
	studentEmail: t.String()
})

export type LeaderboardStudent = typeof LeaderboardStudentSchema.static

// Schema for leaderboard response
export const LeaderboardResponseSchema = t.Object({
	roomName: t.String(),
	openTime: t.Union([t.String(), t.Null()]),
	closeTime: t.Union([t.String(), t.Null()]),
	createdAt: t.Union([t.String(), t.Null()]),
	students: t.Array(LeaderboardStudentSchema)
})

export type LeaderboardResponse = typeof LeaderboardResponseSchema.static

// Schema for add student to room request
export const AddStudentToRoomSchema = t.Object({
	roomId: t.String(),
	studentId: t.String()
})

export type AddStudentToRoomDto = typeof AddStudentToRoomSchema.static

// Schema for add student to room response
export const AddStudentToRoomResponseSchema = t.Object({
	message: t.String()
})

export type AddStudentToRoomResponse = typeof AddStudentToRoomResponseSchema.static

// Schema for room participant
export const RoomParticipantSchema = t.Object({
	participantId: t.String(),
	studentId: t.String(),
	studentFullName: t.Union([t.String(), t.Null()]),
	studentEmail: t.String(),
	joinedAt: t.Union([t.String(), t.Null()])
})

export type RoomParticipant = typeof RoomParticipantSchema.static

// Schema for room participants list response
export const RoomParticipantsListSchema = t.Object({
	roomId: t.String(),
	roomName: t.String(),
	participants: t.Array(RoomParticipantSchema)
})

export type RoomParticipantsList = typeof RoomParticipantsListSchema.static

// Schema for remove student from room response
export const RemoveStudentResponseSchema = t.Object({
	message: t.String()
})

export type RemoveStudentResponse = typeof RemoveStudentResponseSchema.static

// Schema for get testcases request
export const GetTestcasesSchema = t.Object({
	questionId: t.String()
})

export type GetTestcasesDto = typeof GetTestcasesSchema.static

// Schema for testcase item
export const TestcaseItemSchema = t.Object({
	testcaseId: t.String(),
	index: t.Number(),
	input_path: t.String(),
	output_path: t.String(),
	is_hidden: t.Number()
})

// Schema for get testcases response
export const GetTestcasesResponseSchema = t.Object({
	questionId: t.String(),
	testcaseList: t.Array(TestcaseItemSchema)
})

export type GetTestcasesResponse = typeof GetTestcasesResponseSchema.static

// Schema for create testcase request
export const CreateTestcaseSchema = t.Object({
	questionId: t.String(),
	index: t.Number(),
	input_path: t.String(),
	output_path: t.String(),
	is_hidden: t.Number()
})

export type CreateTestcaseDto = typeof CreateTestcaseSchema.static

// Schema for create testcase response
export const CreateTestcaseResponseSchema = t.Object({
	message: t.String(),
	testcaseId: t.String()
})

export type CreateTestcaseResponse = typeof CreateTestcaseResponseSchema.static

// Schema for update testcase request
export const UpdateTestcaseSchema = t.Object({
	questionId: t.String(),
	testcaseId: t.String(),
	index: t.Number(),
	input_path: t.String(),
	output_path: t.String(),
	is_hidden: t.Number()
})

export type UpdateTestcaseDto = typeof UpdateTestcaseSchema.static

// Schema for update testcase response
export const UpdateTestcaseResponseSchema = t.Object({
	message: t.String()
})

export type UpdateTestcaseResponse = typeof UpdateTestcaseResponseSchema.static

// Schema for student question score
export const StudentQuestionScoreSchema = t.Object({
	questionId: t.String(),
	title: t.String(),
	maxScore: t.Union([t.Number(), t.Null()]),
	myScore: t.Number(),
	solved: t.Boolean(),
	attempts: t.Number()
})

// Schema for student score item
export const StudentScoreItemSchema = t.Object({
	studentId: t.String(),
	studentFullName: t.Union([t.String(), t.Null()]),
	studentEmail: t.String(),
	totalScore: t.Number(),
	questions: t.Array(StudentQuestionScoreSchema)
})

// Schema for room scores response
export const RoomScoresResponseSchema = t.Object({
	roomId: t.String(),
	roomName: t.String(),
	students: t.Array(StudentScoreItemSchema)
})

export type RoomScoresResponse = typeof RoomScoresResponseSchema.static
