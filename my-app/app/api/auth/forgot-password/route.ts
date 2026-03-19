import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/mail'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Always return generic message (security)
    const genericResponse = {
      message: 'If an account exists, an OTP has been sent.'
    }

    const user = await prisma.users.findUnique({
      where: { Email: email }
    })

    if (!user) {
      return NextResponse.json(genericResponse)
    }

    // 🔒 Rate limiting & Cooldown
    const now = new Date()

    if (user.OTPCooldownUntil && user.OTPCooldownUntil > now) {
      const minutesLeft = Math.ceil((user.OTPCooldownUntil.getTime() - now.getTime()) / (60 * 1000))
      return NextResponse.json(
        { error: `Too many attempts. Please try again after ${minutesLeft} minutes.` },
        { status: 429 }
      )
    }

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    const recentOtps = await prisma.otps.findMany({
      where: {
        Email: email,
        CreatedAt: { gt: oneMinuteAgo }
      },
      orderBy: { CreatedAt: 'desc' }
    })

    if (recentOtps.length > 0) {
      return NextResponse.json(
        { error: 'Please wait a minute before requesting another OTP.' },
        { status: 429 }
      )
    }

    // Update OTP Count and Cooldown
    let newOTPCount = (user.OTPCount || 0) + 1
    let cooldownUntil = null

    if (newOTPCount >= 3) {
      cooldownUntil = new Date(Date.now() + 30 * 60 * 1000)
      newOTPCount = 0 // Reset for after cooldown
    }

    await prisma.users.update({
      where: { Email: email },
      data: {
        OTPCount: newOTPCount,
        OTPCooldownUntil: cooldownUntil
      }
    })

    // 🧹 Delete old OTPs
    await prisma.otps.deleteMany({
      where: { Email: email }
    })

    // 🔢 Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const hashedOtp = await bcrypt.hash(otp, 10)

    await prisma.otps.create({
      data: {
        Email: email,
        Code: hashedOtp,
        ExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    })

    // 📧 Send email (IMPORTANT: Do NOT break if fails)
    try {
      await sendOTPEmail(email, otp)
    } catch (mailError) {
      console.error('Mail error:', mailError)
    }

    return NextResponse.json(genericResponse)

  } catch (error: any) {
    console.error('Forgot password error:', error)

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}