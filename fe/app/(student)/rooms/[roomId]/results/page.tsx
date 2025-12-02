export default function RoomResultsPage({
	params,
}: {
	params: { roomId: string }
}) {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Results</h1>
			<p className="mt-2 text-muted-foreground">
				View score and solved questions for room {params.roomId} (US-S-010)
			</p>
		</div>
	)
}
