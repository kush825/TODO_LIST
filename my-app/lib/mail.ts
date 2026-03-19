import nodemailer from 'nodemailer'

export async function sendOTPEmail(email: string, otp: string) {

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error('Email credentials not configured')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })

  const info = await transporter.sendMail({
    from: `"Todo App" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP',
    html: `
      <h2>Password Reset</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  })

  console.log('Message sent:', info.messageId)
}

export async function sendWelcomeEmail(email: string, name: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error('Email credentials not configured')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })

  const info = await transporter.sendMail({
    from: `"Todo App" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Todo App! 🚀',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
          .content { padding: 40px 30px; text-align: left; }
          .content h2 { color: #1e293b; font-size: 22px; margin-top: 0; }
          .content p { color: #475569; font-size: 16px; margin-bottom: 24px; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { background: #6366f1 !important; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; transition: background 0.3s ease; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
          .highlight { color: #6366f1; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Todo App</h1>
          </div>
          <div class="content">
            <h2>Welcome aboard, ${name}! 👋</h2>
            <p>We're thrilled to have you here. Your journey to productivity begins now!</p>
            <p>With <span class="highlight">Todo App</span>, you can organize your tasks, stay on top of your goals, and achieve more every day. We've designed everything to be simple, fast, and beautiful.</p>
            <div class="button-container">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}" class="button">Go to Dashboard</a>
            </div>
            <p>If you have any questions, feel free to reply to this email. We're always here to help!</p>
            <p>Happy tasking!<br>The Todo App Team</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Todo App. All rights reserved.<br>
            Helping you get things done, one task at a time.
          </div>
        </div>
      </body>
      </html>
    `,
  })

  console.log('Welcome email sent:', info.messageId)
}
