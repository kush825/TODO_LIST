'use client'

import { register } from '@/actions/auth'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            const result = await register(formData)
            if (result?.error) {
                setError(result.error)
                setLoading(false)
            } else if (result?.success) {
                setSuccess(true)
                // Wait for 2 seconds before redirecting
                setTimeout(() => {
                    router.push('/auth/login')
                }, 2000)
            }
        } catch (e) {
            setError('Something went wrong')
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                        <CheckCircle className="h-10 w-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
                    <p className="text-white/60 mb-6">Your account has been successfully created.</p>
                    <div className="flex items-center gap-2 text-purple-300 text-sm animate-pulse">
                        Redirecting to login...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-white/60">Join us and organize your tasks</p>
            </div>

            <form action={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                    <input
                        name="name"
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                    <div className="relative">
                        <input
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
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-white/60">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
