export default async function RoomLeaderboardPage({
	params,
}: {
	params: Promise<{ roomId: string }>
}) {
	const { roomId } = await params
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Room Leaderboard</h1>
			<p className="mt-2 text-muted-foreground">
				View leaderboard for room {roomId} (US-A-020)
			</p>
		</div>
	)
}
