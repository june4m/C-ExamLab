export default function RoomExamsPage({
	params,
}: {
	params: { roomId: string }
}) {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Exams in Room</h1>
			<p className="mt-2 text-muted-foreground">
				View exams (questions) in room {params.roomId} (US-S-005)
			</p>
		</div>
	)
}

