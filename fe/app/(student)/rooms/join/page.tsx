'use client'

import { JoinRoomForm } from '@/components/student/JoinRoomForm'

export default function JoinRoomPage() {
	return (
		<div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">
			<div className="w-full max-w-md">
				<div className="mb-6 text-center">
					<h1 className="text-3xl font-bold">Join Exam Room</h1>
					<p className="mt-2 text-muted-foreground">
						Enter the room ID and code provided by your instructor
					</p>
				</div>
				<JoinRoomForm />
			</div>
		</div>
	)
}
