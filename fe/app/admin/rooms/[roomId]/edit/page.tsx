export default async function EditRoomPage({
	params
}: {
	params: Promise<{ roomId: string }>
}) {
	const { roomId } = await params
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Edit Exam Room</h1>
			<p className="mt-2 text-muted-foreground">
				Update exam room {roomId} (US-A-004)
			</p>
		</div>
	)
}
