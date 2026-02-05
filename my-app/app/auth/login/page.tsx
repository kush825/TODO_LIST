'use client'

import { login } from '@/actions/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError('')
        try {
            const result = await login(formData)
            if (result?.error) {
                setError(result.error)
                toast.error(result.error)
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

    return (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-white/60">Sign in to continue to your Todo List</p>
            </div>

            <form action={handleSubmit} className="space-y-6">
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
