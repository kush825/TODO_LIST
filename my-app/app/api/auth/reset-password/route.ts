import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      )
    }

    // 🔍 Check user exists
    const user = await prisma.users.findUnique({
      where: { Email: email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // 🔍 Get latest valid OTP
    const latestOtp = await prisma.otps.findFirst({
      where: {
        Email: email,
        ExpiresAt: { gt: new Date() }
      },
      orderBy: { CreatedAt: 'desc' }
    })

    if (!latestOtp) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // 🔐 Compare OTP
    const isOtpValid = await bcrypt.compare(otp, latestOtp.Code)

    if (!isOtpValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // 🔒 Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // 🔄 Update password and reset OTP limits
    await prisma.users.update({
      where: { Email: email },
      data: {
        PasswordHash: passwordHash,
        OTPCount: 0,
        OTPCooldownUntil: null
      }
    })

    // 🧹 Delete all OTPs for that email
    await prisma.otps.deleteMany({
      where: { Email: email }
    })

    return NextResponse.json({
      message: 'Password reset successful'
    })

  } catch (error) {
    console.error('Reset password error:', error)

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}