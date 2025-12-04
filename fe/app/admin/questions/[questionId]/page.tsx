export default async function AdminQuestionDetailPage({
	params,
}: {
	params: Promise<{ questionId: string }>
}) {
	const { questionId } = await params
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Question Details</h1>
			<p className="mt-2 text-muted-foreground">
				View question details for question {questionId} (US-A-007)
			</p>
		</div>
	)
}
