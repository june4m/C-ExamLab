import { t } from 'elysia'

// User Profile Response
export const UserProfileSchema = t.Object({
	uuid: t.String(),
	email: t.String(),
	fullName: t.Union([t.String(), t.Null()]),
	createdAt: t.Union([t.String(), t.Null()]),
	lastLogin: t.Union([t.String(), t.Null()])
})

export type UserProfile = typeof UserProfileSchema.static

// Join Room Request
export const JoinRoomSchema = t.Object({
	roomCode: t.String({ minLength: 6, maxLength: 6 })
})

export type JoinRoomDto = typeof JoinRoomSchema.static

// Join Room Response
export const JoinRoomResponseSchema = t.Object({
	message: t.String(),
	roomId: t.String(),
	roomName: t.String(),
	openTime: t.Union([t.String(), t.Null()]),
	closeTime: t.Union([t.String(), t.Null()])
})

export type JoinRoomResponse = typeof JoinRoomResponseSchema.static

// Update Student Profile Request
export const UpdateStudentProfileSchema = t.Object({
	studentId: t.String(),
	full_name: t.String({ maxLength: 48 }),
	email: t.String({ format: 'email' })
})

export type UpdateStudentProfileDto = typeof UpdateStudentProfileSchema.static

// Update Student Profile Response
export const UpdateStudentProfileResponseSchema = t.Object({
	message: t.String()
})

export type UpdateStudentProfileResponse = typeof UpdateStudentProfileResponseSchema.static

// Student Room Item
export const StudentRoomItemSchema = t.Object({
	roomId: t.String(),
	name: t.String(),
	open_time: t.Union([t.String(), t.Null()]),
	close_time: t.Union([t.String(), t.Null()])
})

// Get Student Rooms Response
export const StudentRoomsResponseSchema = t.Object({
	roomList: t.Array(StudentRoomItemSchema)
})

export type StudentRoomsResponse = typeof StudentRoomsResponseSchema.static

// Exam Item Schema
export const ExamItemSchema = t.Object({
	questionId: t.String(),
	title: t.String(),
	description_path: t.Union([t.String(), t.Null()]),
	score: t.Union([t.Number(), t.Null()]),
	time_limit: t.Union([t.Number(), t.Null()])
})

// Get Room Exams Response
export const RoomExamsResponseSchema = t.Object({
	exams: t.Array(ExamItemSchema)
})

export type RoomExamsResponse = typeof RoomExamsResponseSchema.static

// Submit Question Request
export const SubmitQuestionSchema = t.Object({
	roomId: t.String(),
	questionId: t.String(),
	answerCode: t.String()
})

export type SubmitQuestionDto = typeof SubmitQuestionSchema.static

// Submission Detail Item
export const SubmissionDetailItemSchema = t.Object({
	testCaseIndex: t.Number(),
	status: t.String(),
	runTime: t.Union([t.Number(), t.Null()]),
	memoryUsed: t.Union([t.Number(), t.Null()]),
	stdout: t.Union([t.String(), t.Null()]),
	stderr: t.Union([t.String(), t.Null()])
})

// Submit Question Response
export const SubmitQuestionResponseSchema = t.Object({
	status: t.String(),
	score: t.Union([t.Number(), t.Null()]),
	totalRunTime: t.Union([t.Number(), t.Null()]),
	memoryUsed: t.Union([t.Number(), t.Null()]),
	details: t.Array(SubmissionDetailItemSchema)
})

export type SubmitQuestionResponse = typeof SubmitQuestionResponseSchema.static

// View My Score Request
export const ViewMyScoreSchema = t.Object({
	roomId: t.String(),
	studentId: t.String()
})

export type ViewMyScoreDto = typeof ViewMyScoreSchema.static

// Question Score Item
export const QuestionScoreItemSchema = t.Object({
	questionId: t.String(),
	title: t.String(),
	score: t.Union([t.Number(), t.Null()]),
	myScore: t.Union([t.Number(), t.Null()]),
	solved: t.Boolean(),
	attempts: t.Number(),
	bestSubmissionId: t.Union([t.String(), t.Null()])
})

// View My Score Response
export const ViewMyScoreResponseSchema = t.Object({
	totalScore: t.Number(),
	questions: t.Array(QuestionScoreItemSchema)
})

export type ViewMyScoreResponse = typeof ViewMyScoreResponseSchema.static
