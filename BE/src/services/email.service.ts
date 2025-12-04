import nodemailer from 'nodemailer'
import {
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASS,
	SMTP_FROM
} from '../configurations/env'

// Create transporter
const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: parseInt(SMTP_PORT),
	secure: parseInt(SMTP_PORT) === 465,
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS
	}
})

export interface SendEmailOptions {
	to: string
	subject: string
	html: string
}

export const emailService = {
	async sendEmail(options: SendEmailOptions): Promise<boolean> {
		try {
			if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
				console.warn('[Email] SMTP not configured, skipping email send')
				return false
			}

			await transporter.sendMail({
				from: SMTP_FROM,
				to: options.to,
				subject: options.subject,
				html: options.html
			})

			console.log(`[Email] Sent to ${options.to}: ${options.subject}`)
			return true
		} catch (error) {
			console.error('[Email] Failed to send:', error)
			return false
		}
	},

	async sendRoomCodeEmail(
		email: string,
		studentName: string | null,
		roomName: string,
		roomCode: string,
		openTime: Date
	): Promise<boolean> {
		const formattedTime = openTime.toLocaleString('vi-VN', {
			timeZone: 'Asia/Ho_Chi_Minh',
			dateStyle: 'full',
			timeStyle: 'short'
		})

		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #2563eb;">🎓 Thông báo mã phòng thi</h2>
				<p>Xin chào <strong>${studentName || 'bạn'}</strong>,</p>
				<p>Bạn đã được đăng ký tham gia phòng thi:</p>
				<div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
					<p style="margin: 5px 0;"><strong>Tên phòng:</strong> ${roomName}</p>
					<p style="margin: 5px 0;"><strong>Thời gian mở:</strong> ${formattedTime}</p>
					<p style="margin: 20px 0 5px 0;"><strong>Mã phòng thi:</strong></p>
					<div style="background: #2563eb; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 15px; border-radius: 8px; letter-spacing: 8px;">
						${roomCode}
					</div>
				</div>
				<p style="color: #6b7280;">⏰ Bạn có thể vào phòng thi trước 15 phút so với giờ mở.</p>
				<p style="color: #6b7280;">📝 Hãy chuẩn bị sẵn sàng và chúc bạn thi tốt!</p>
				<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #9ca3af; font-size: 12px;">Email này được gửi tự động từ hệ thống ExamLab.</p>
			</div>
		`

		return this.sendEmail({
			to: email,
			subject: `[ExamLab] Mã phòng thi: ${roomName}`,
			html
		})
	}
}
