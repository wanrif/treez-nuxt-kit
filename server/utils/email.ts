import nodemailer from 'nodemailer'

// Configure nodemailer transporter
// You should use environment variables for sensitive information
const transporter = nodemailer.createTransport({
  host: process.env.NUXT_EMAIL_HOST, // e.g., 'smtp.example.com'
  port: Number(process.env.NUXT_EMAIL_PORT || 587), // e.g., 587 or 465
  // secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.NUXT_EMAIL_USER, // your email address
    pass: process.env.NUXT_EMAIL_PASSWORD, // your email password or app password
  },
})

export const sendEmail = async ({
  html,
  subject = 'Welcome',
  to = '',
}: {
  html: string
  subject?: string
  to?: string
  request?: Request
}) => {
  if (!to) {
    console.error('Email recipient (to) is missing.')
    return // Or throw an error
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER, // sender address
    to, // list of receivers
    subject, // Subject line
    html, // html body
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
    console.error(`Error sending email to ${to}:`, error)
    // Handle error appropriately, maybe re-throw or log more details
  }
}
