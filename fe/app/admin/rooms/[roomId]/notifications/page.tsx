export default async function RoomNotificationsPage({
	params
}: {
	params: Promise<{ roomId: string }>
}) {
	const { roomId } = await params
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Schedule Notifications</h1>
			<p className="mt-2 text-muted-foreground">
				Schedule email notifications for room {roomId} (US-A-019)
			</p>
		</div>
	)
}
