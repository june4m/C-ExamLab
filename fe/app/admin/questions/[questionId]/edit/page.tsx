export default async function EditQuestionPage({
	params,
}: {
	params: Promise<{ questionId: string }>
}) {
	const { questionId } = await params
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Edit Question</h1>
			<p className="mt-2 text-muted-foreground">
				Update question {questionId} (US-A-009)
			</p>
		</div>
	)
}
