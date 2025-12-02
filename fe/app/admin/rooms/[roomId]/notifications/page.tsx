export default function RoomNotificationsPage({
	params
}: {
	params: { roomId: string }
}) {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Schedule Notifications</h1>
			<p className="mt-2 text-muted-foreground">
				Schedule email notifications for room {params.roomId} (US-A-019)
			</p>
		</div>
	)
}
