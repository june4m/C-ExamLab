export default function QuestionTestCasesPage({
	params,
}: {
	params: { questionId: string }
}) {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Test Cases</h1>
			<p className="mt-2 text-muted-foreground">
				Manage test cases for question {params.questionId} (US-A-011,
				US-A-012, US-A-013, US-A-014)
			</p>
		</div>
	)
}

