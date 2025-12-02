export default function QuestionPage({
	params,
}: {
	params: { roomId: string; questionId: string }
}) {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Question</h1>
			<p className="mt-2 text-muted-foreground">
				Room: {params.roomId}, Question: {params.questionId} (US-S-006,
				US-S-007, US-S-008: Code editor, test, and submit)
			</p>
		</div>
	)
}
