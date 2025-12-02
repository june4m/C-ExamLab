// Leaderboard interfaces based on API specs

export interface LeaderboardEntry {
  roomId: string
  accountId: string
  joinedAt: string
  optionals: {
    studentName: string
    studentCode?: string
    email: string
    score?: number
    isBanned?: boolean
  }
}

export interface LeaderboardResponse {
  roomId: string
  entries: LeaderboardEntry[]
}

export interface BanStudentRequest {
  studentId: string
  roomId: string
}

export interface BanStudentResponse {
  message: string
}
