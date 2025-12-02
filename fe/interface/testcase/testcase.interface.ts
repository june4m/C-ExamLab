// Test case interfaces based on API specs

export interface TestCase {
  testcaseId: string
  questionId: string
  index: number
  inputPath: string
  outputPath: string
  isHidden: number
}

export interface CreateTestCaseRequest {
  questionId: string
  index: number
  input_path: string
  output_path: string
  is_hidden: number
}

export interface CreateTestCaseResponse {
  message: string
  testcaseId: string
}

export interface UpdateTestCaseRequest {
  questionId: string
  testcaseId: string
  index: number
  input_path: string
  output_path: string
  is_hidden: number
}

export interface TestCaseListResponse {
  questionId: string
  testcaseList: TestCase[]
}
