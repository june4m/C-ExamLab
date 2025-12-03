export default function RoomDashboardPage({
	params,
}: {
	params: { roomId: string }
}) {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Room Dashboard</h1>
			<p className="mt-2 text-muted-foreground">
				Room ID: {params.roomId}
			</p>
		</div>
	)
}
