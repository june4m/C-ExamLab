// Quiz interfaces based on Swagger/API specification

export interface QuizListItem {
	uuid: string
	title: string
	description: string | null
	isActive: boolean
	createdAt: string
}

export interface Answer {
	content: string
	isCorrect: boolean
}

export interface Question {
	content: string
	points: number
	type: string
	answers: Answer[]
}

export interface CreateQuizBody {
	title: string
	description?: string
	questions: Question[]
}

export interface SubmitBody {
	answers: {
		questionUuid: string
		selectedAnswerUuids: string[]
	}[]
}

// Extended interfaces for API responses
export interface QuizDetail extends QuizListItem {
	questions?: QuestionWithUuid[]
}

export interface QuestionWithUuid {
	uuid: string
	content: string
	points: number
	type: string
	answers: AnswerWithUuid[]
	order?: number
}

// Answer in response does NOT include isCorrect (for security)
export interface AnswerWithUuid {
	uuid: string
	content: string
}

export interface QuizSubmissionResponse {
	uuid: string
	quizUuid: string
	accountUuid: string
	score: number
	totalPoints: number
	submittedAt: string
}

