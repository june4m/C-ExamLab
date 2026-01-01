import {
	mysqlTable,
	varchar,
	char,
	datetime,
	text,
	int,
	tinyint,
	mysqlEnum,
	uniqueIndex,
	double
} from 'drizzle-orm/mysql-core'
import { relations, sql } from 'drizzle-orm'

// 1. accounts table
export const accounts = mysqlTable('accounts', {
	uuid: char('uuid', { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	fullName: varchar('full_name', { length: 48 }),
	email: varchar('email', { length: 59 }).notNull().unique(),
	password: varchar('password', { length: 100 }).notNull(),
	role: mysqlEnum('role', ['USER', 'ADMIN']).default('USER').notNull(),
	isBanned: tinyint('is_banned').default(0).notNull(),
	createdAt: datetime('created_at', { fsp: 6 }).default(
		sql`CURRENT_TIMESTAMP(6)`
	),
	updatedAt: datetime('updated_at', { fsp: 6 }).default(
		sql`CURRENT_TIMESTAMP(6)`
	),
	lastLogin: datetime('last_login', { fsp: 6 })
})

// 2. rooms table
export const rooms = mysqlTable('rooms', {
	uuid: char('uuid', { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	code: char('code', { length: 6 }).notNull().unique(),
	name: varchar('name', { length: 100 }).notNull(),
	openTime: datetime('open_time', { fsp: 6 }),
	closeTime: datetime('close_time', { fsp: 6 }),
	createdBy: char('created_by', { length: 36 })
		.notNull()
		.references(() => accounts.uuid),
	createdAt: datetime('created_at', { fsp: 6 }).default(
		sql`CURRENT_TIMESTAMP(6)`
	),
	updatedAt: datetime('updated_at', { fsp: 6 }).default(
		sql`CURRENT_TIMESTAMP(6)`
	),
	reminderSentAt: datetime('reminder_sent_at', { fsp: 6 }).default(sql`NULL`)
})

// 3. room_participants table
export const roomParticipants = mysqlTable(
	'room_participants',
	{
		uuid: char('uuid', { length: 36 })
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		roomUuid: char('room_uuid', { length: 36 })
			.notNull()
			.references(() => rooms.uuid),
		accountUuid: char('account_uuid', { length: 36 })
			.notNull()
			.references(() => accounts.uuid),
		joinedAt: datetime('joined_at', { fsp: 6 }).default(
			sql`CURRENT_TIMESTAMP(6)`
		)
	},
	table => ({
		roomAccountIdx: uniqueIndex('uq_room_account').on(
			table.roomUuid,
			table.accountUuid
		)
	})
)

// 4. questions table
export const questions = mysqlTable('questions', {
	uuid: char('uuid', { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	roomUuid: char('room_uuid', { length: 36 })
		.notNull()
		.references(() => rooms.uuid),
	title: varchar('title', { length: 200 }).notNull(),
	descriptionPath: text('description_path'),
	score: int('score').default(100),
	timeLimit: int('time_limit').default(1000),
	memoryLimit: int('memory_limit').default(262144),
	order: int('order').default(0),
	createdAt: datetime('created_at', { fsp: 6 }).default(
		sql`CURRENT_TIMESTAMP(6)`
	)
})

// 5. test_cases table
export const testCases = mysqlTable(
	'test_cases',
	{
		uuid: char('uuid', { length: 36 })
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		questionUuid: char('question_uuid', { length: 36 })
			.notNull()
			.references(() => questions.uuid),
		index: int('index').notNull(),
		inputPath: text('input_path').notNull(),
		outputPath: text('output_path').notNull(),
		isHidden: tinyint('is_hidden').default(1)
	},
	table => ({
		questionIndexIdx: uniqueIndex('uq_question_index').on(
			table.questionUuid,
			table.index
		)
	})
)

// 6. submissions table
export const submissions = mysqlTable('submissions', {
	uuid: char('uuid', { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	questionUuid: char('question_uuid', { length: 36 })
		.notNull()
		.references(() => questions.uuid),
	accountUuid: char('account_uuid', { length: 36 })
		.notNull()
		.references(() => accounts.uuid),
	filePath: text('file_path').notNull(),
	language: varchar('language', { length: 20 }).notNull(),
	status: mysqlEnum('status', [
		'PENDING',
		'RUNNING',
		'AC',
		'WA',
		'TLE',
		'MLE',
		'RE',
		'CE',
		'JUDGE_ERROR'
	]).default('PENDING'),
	score: int('score'),
	totalRunTime: int('total_run_time'),
	memoryUsed: int('memory_used'),
	createdAt: datetime('created_at', { fsp: 6 }).default(
		sql`CURRENT_TIMESTAMP(6)`
	)
})

// 7. submission_details table
export const submissionDetails = mysqlTable('submission_details', {
	uuid: char('uuid', { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	submissionUuid: char('submission_uuid', { length: 36 })
		.notNull()
		.references(() => submissions.uuid),
	testcaseUuid: char('testcase_uuid', { length: 36 })
		.notNull()
		.references(() => testCases.uuid),
	index: int('index').notNull(),
	status: mysqlEnum('status', [
		'AC',
		'WA',
		'TLE',
		'MLE',
		'RE',
		'SKIP'
	]).notNull(),
	runTime: int('run_time'),
	memoryUsed: int('memory_used'),
	stdout: text('stdout'),
	stderr: text('stderr')
})

// 8. password_reset_tokens table
export const passwordResetTokens = mysqlTable('password_reset_tokens', {
	uuid: char('uuid', { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	accountUuid: char('account_uuid', { length: 36 })
		.notNull()
		.references(() => accounts.uuid),
	token: varchar('token', { length: 100 }).notNull().unique(),
	expiresAt: datetime('expires_at', { fsp: 6 }).notNull(),
	usedAt: datetime('used_at', { fsp: 6 }),
	createdAt: datetime('created_at', { fsp: 6 }).default(
		sql`CURRENT_TIMESTAMP(6)`
	)
})

// Relations
export const accountsRelations = relations(accounts, ({ many }) => ({
	createdRooms: many(rooms),
	roomParticipants: many(roomParticipants),
	submissions: many(submissions)
}))

export const roomsRelations = relations(rooms, ({ one, many }) => ({
	creator: one(accounts, {
		fields: [rooms.createdBy],
		references: [accounts.uuid]
	}),
	participants: many(roomParticipants),
	questions: many(questions)
}))

export const roomParticipantsRelations = relations(
	roomParticipants,
	({ one }) => ({
		room: one(rooms, {
			fields: [roomParticipants.roomUuid],
			references: [rooms.uuid]
		}),
		account: one(accounts, {
			fields: [roomParticipants.accountUuid],
			references: [accounts.uuid]
		})
	})
)

export const questionsRelations = relations(questions, ({ one, many }) => ({
	room: one(rooms, {
		fields: [questions.roomUuid],
		references: [rooms.uuid]
	}),
	testCases: many(testCases),
	submissions: many(submissions)
}))

export const testCasesRelations = relations(testCases, ({ one, many }) => ({
	question: one(questions, {
		fields: [testCases.questionUuid],
		references: [questions.uuid]
	}),
	submissionDetails: many(submissionDetails)
}))

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
	question: one(questions, {
		fields: [submissions.questionUuid],
		references: [questions.uuid]
	}),
	account: one(accounts, {
		fields: [submissions.accountUuid],
		references: [accounts.uuid]
	}),
	details: many(submissionDetails)
}))

export const submissionDetailsRelations = relations(
	submissionDetails,
	({ one }) => ({
		submission: one(submissions, {
			fields: [submissionDetails.submissionUuid],
			references: [submissions.uuid]
		}),
		testCase: one(testCases, {
			fields: [submissionDetails.testcaseUuid],
			references: [testCases.uuid]
		})
	})
)

// 9. quizzes table
export const quizzes = mysqlTable('quizzes', {
	uuid: char('uuid', { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: varchar('title', { length: 200 }).notNull(),
	description: text('description'),
	isActive: tinyint('is_active').default(1).notNull(),
	createdAt: datetime('created_at', { fsp: 6 }).default(
		sql`CURRENT_TIMESTAMP(6)`
	),
	updatedAt: datetime('updated_at', { fsp: 6 }).default(
		sql`CURRENT_TIMESTAMP(6)`
	)
})

// 10. quiz_questions table
export const quizQuestions = mysqlTable('quiz_questions', {
	uuid: char('uuid', { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	quizUuid: char('quiz_uuid', { length: 36 })
		.notNull()
		.references(() => quizzes.uuid),
	content: text('content').notNull(),
	points: double('points').default(1).notNull(),
	type: varchar('type', { length: 50 }).default('MULTIPLE_CHOICE').notNull(),
	order: int('order').default(0),
	createdAt: datetime('created_at', { fsp: 6 }).default(
		sql`CURRENT_TIMESTAMP(6)`
	)
})

// 11. quiz_answers table
export const quizAnswers = mysqlTable('quiz_answers', {
	uuid: char('uuid', { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	questionUuid: char('question_uuid', { length: 36 })
		.notNull()
		.references(() => quizQuestions.uuid),
	content: text('content').notNull(),
	isCorrect: tinyint('is_correct').default(0).notNull()
})

// 12. quiz_submissions table
export const quizSubmissions = mysqlTable('quiz_submissions', {
	uuid: char('uuid', { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	quizUuid: char('quiz_uuid', { length: 36 })
		.notNull()
		.references(() => quizzes.uuid),
	accountUuid: char('account_uuid', { length: 36 })
		.notNull()
		.references(() => accounts.uuid),
	score: double('score').notNull(),
	totalPoints: double('total_points').notNull(),
	submittedAt: datetime('submitted_at', { fsp: 6 }).default(
		sql`CURRENT_TIMESTAMP(6)`
	)
})

// Relations for Quiz
export const quizzesRelations = relations(quizzes, ({ many }) => ({
	questions: many(quizQuestions),
	submissions: many(quizSubmissions)
}))

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
	quiz: one(quizzes, {
		fields: [quizQuestions.quizUuid],
		references: [quizzes.uuid]
	}),
	answers: many(quizAnswers)
}))

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
	question: one(quizQuestions, {
		fields: [quizAnswers.questionUuid],
		references: [quizQuestions.uuid]
	})
}))

export const quizSubmissionsRelations = relations(quizSubmissions, ({ one }) => ({
	quiz: one(quizzes, {
		fields: [quizSubmissions.quizUuid],
		references: [quizzes.uuid]
	}),
	account: one(accounts, {
		fields: [quizSubmissions.accountUuid],
		references: [accounts.uuid]
	})
}))
