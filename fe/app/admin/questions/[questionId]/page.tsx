export default function AdminQuestionDetailPage({
	params,
}: {
	params: { questionId: string }
}) {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Question Details</h1>
			<p className="mt-2 text-muted-foreground">
				View question details for question {params.questionId} (US-A-007)
			</p>
		</div>
	)
}
