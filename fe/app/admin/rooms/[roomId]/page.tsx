export default function AdminRoomDetailPage({
	params
}: {
	params: { roomId: string }
}) {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Room Details</h1>
			<p className="mt-2 text-muted-foreground">
				View room details for room {params.roomId} (US-A-002)
			</p>
		</div>
	)
}
