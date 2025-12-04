export default async function AdminUserDetailPage({
	params
}: {
	params: Promise<{ userId: string }>
}) {
	const { userId } = await params
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Student details</h1>
			<p className="mt-2 text-muted-foreground">
				View student details for user {userId} (US-A-016)
			</p>
		</div>
	)
}
