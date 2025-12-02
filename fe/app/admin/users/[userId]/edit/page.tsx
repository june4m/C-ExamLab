export default function EditUserPage({
	params,
}: {
	params: { userId: string }
}) {
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold">Edit Student</h1>
			<p className="mt-2 text-muted-foreground">
				Update student information for user {params.userId} (US-A-017)
			</p>
		</div>
	)
}

