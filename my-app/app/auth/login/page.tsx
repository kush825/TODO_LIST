'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [forgotStep, setForgotStep] = useState<'none' | 'email' | 'otp'>('none')
    const [resetEmail, setResetEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [showResetPassword, setShowResetPassword] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)
    const [timerActive, setTimerActive] = useState(false)
    const router = useRouter()

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (timerActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setTimerActive(false)
        }
        return () => clearInterval(timer)
    }, [timerActive, timeLeft])

    const startTimer = () => {
        setTimeLeft(60)
        setTimerActive(true)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Login failed')
                toast.error(result.error || 'Login failed')
                setLoading(false)
            } else if (result?.success && result?.redirectUrl) {
                toast.success('Welcome back!')
                router.push(result.redirectUrl)
            }
        } catch (e) {
            setError('An unexpected error occurred')
            toast.error('An unexpected error occurred')
            setLoading(false)
        }
    }

    async function handleRequestOTP(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('OTP sent to your email')
                setForgotStep('otp')
                startTimer()
            } else {
                toast.error(data.error || 'Failed to send OTP')
            }
        } catch (err) {
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, otp, newPassword })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Password reset successful')
                setForgotStep('none')
                setResetEmail('')
                setOtp('')
                setNewPassword('')
            } else {
                toast.error(data.error || 'Failed to reset password')
            }
        } catch (err) {
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (forgotStep === 'email') {
        return (
            <div key="forgot-email" className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
                    <p className="text-white/60">Enter your email to receive an OTP</p>
                </div>
                <form onSubmit={handleRequestOTP} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                        <input
                            key="reset-email-input"
                            type="email"
                            required
                            value={resetEmail || ''}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setForgotStep('none')}
                        className="w-full text-white/60 hover:text-white text-sm transition-colors"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        )
    }

    if (forgotStep === 'otp') {
        return (
            <div key="forgot-otp" className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Verify OTP</h1>
                    <p className="text-white/60">Enter the 6-digit code and your new password</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">OTP Code</label>
                        <input
                            key="otp-input"
                            type="text"
                            required
                            maxLength={6}
                            value={otp || ''}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-[10px] placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="000000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                key="new-password-input"
                                type={showResetPassword ? "text" : "password"}
                                required
                                value={newPassword || ''}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowResetPassword(!showResetPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                                {showResetPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    <div className="text-center space-y-4">
                        {timerActive ? (
                            <p className="text-sm text-white/60">
                                Resend OTP in <span className="text-purple-400 font-mono font-bold">{timeLeft}s</span>
                            </p>
                        ) : (
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleRequestOTP}
                                className="w-full text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Resend OTP
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setForgotStep('email')}
                            className="w-full text-white/60 hover:text-white text-sm transition-colors"
                        >
                            Change Email
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div key="login-form" className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-white/60">Sign in to continue to your Todo List</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                    <input
                        key="login-email-input"
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-white/80">Password</label>
                    </div>
                    <div className="relative">
                        <input
                            key="login-password-input"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <div className="flex justify-end mt-2">
                        <button
                            type="button"
                            onClick={() => setForgotStep('email')}
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-white/60">
                    Don't have an account?{' '}
                    <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}
