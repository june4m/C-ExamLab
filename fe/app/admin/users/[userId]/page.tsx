export default function AdminUserDetailPage({
	params,
}: {
	params: { userId: string }
}) {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Student Details</h1>
			<p className="mt-2 text-muted-foreground">
				View student details for user {params.userId} (US-A-016)
			</p>
		</div>
	)
}

