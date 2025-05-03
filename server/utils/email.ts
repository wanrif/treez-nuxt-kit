import nodemailer from 'nodemailer'

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.NUXT_EMAIL_HOST,
  port: Number(process.env.NUXT_EMAIL_PORT || 587),
  // secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.NUXT_EMAIL_USER,
    pass: process.env.NUXT_EMAIL_PASSWORD,
  },
})

export default async function sendEmail({
  html,
  subject = 'Welcome',
  to = '',
}: {
  html: string
  subject?: string
  to?: string
  request?: Request
}) {
  if (!to) {
    logger.log({
      level: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Email recipient (to) is missing.',
    })
    throw new Error('Email recipient (to) is missing.')
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    logger.log({
      level: 'info',
      code: 'REQUEST',
      statusCode: 200,
      message: `Email sent to: ${to} with subject: ${subject}. Message ID: ${info.messageId}`,
    })
  } catch (error) {
    logger.log({
      level: 'error',
      code: 'EMAIL_ERROR',
      message: `Failed to send email to ${to}: ${error}`,
    })
    throw new Error(`Failed to send email: ${error}`)
  }
}
