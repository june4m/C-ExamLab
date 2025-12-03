export default function EditQuestionPage({
	params,
}: {
	params: { questionId: string }
}) {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Edit Question</h1>
			<p className="mt-2 text-muted-foreground">
				Update question {params.questionId} (US-A-009)
			</p>
		</div>
	)
}
