// Question interfaces based on API specs

export interface Question {
  questionId: string
  title: string
  descriptionPath: string
  score: number
  timeLimit: number
  memoryLimit: number
  order: number
  createdAt: string
  roomId: string
  code?: string
}

export interface CreateQuestionRequest {
  title: string
  descriptionPath: string
  score: number
  timeLimit: number
  memoryLimit: number
  order: number
  created_at: Date
  roomId: string
}

export interface CreateQuestionResponse {
  message: string
  questionUuid: string
}

export interface UpdateQuestionRequest {
  questionId: string
  title: string
  descriptionPath: string
  score: number
  timeLimit: number
  memoryLimit: number
  order: number
  created_at: Date
  roomId: string
}

export interface QuestionListResponse {
  listQuestion: Question[]
}
