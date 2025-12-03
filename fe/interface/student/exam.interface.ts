// Student Exam interfaces

export interface Exam {
	questionId: string
	title: string
	description_path: string
	score: number
	time_limit: number // in minutes or seconds (INT)
	description?: string // Fetched description content
}

export interface ExamListResponse {
	exams: Exam[]
}

