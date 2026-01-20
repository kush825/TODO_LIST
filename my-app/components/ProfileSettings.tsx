'use client'

import { updateUserProfile, deleteProfileImage } from '@/actions/profile'
import { Save, Lock, Trash2, Camera } from 'lucide-react'
import { useState } from 'react'

interface ProfileSettingsProps {
    user: {
        UserName: string
        Email: string
        ProfileImage?: string | null
    }
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setMessage(null)

        const result = await updateUserProfile(formData)

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully' })
        }

        setIsLoading(false)
    }

    async function handleDeleteImage() {
        if (!confirm('Are you sure you want to remove your profile photo?')) return

        setIsLoading(true)
        setMessage(null)

        const result = await deleteProfileImage()

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Profile photo removed' })
        }
        setIsLoading(false)
    }

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6 h-full">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-500" />
                Account Settings
            </h3>

            <div className="mb-6 flex items-center gap-4">
                <div className="relative group">
                    {user.ProfileImage ? (
                        <div className="relative">
                            <img src={user.ProfileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500/50" />
                            <button
                                onClick={handleDeleteImage}
                                disabled={isLoading}
                                className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="Remove photo"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center ring-2 ring-white/10">
                            <Camera className="w-6 h-6 text-slate-500" />
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-white">Profile Photo</p>
                    <p className="text-xs text-slate-400">Click the upload button in the header to change.</p>
                </div>
            </div>

            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={user.UserName}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-slate-600"
                        placeholder="Enter your name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                    <input
                        type="email"
                        value={user.Email}
                        disabled
                        className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-600 mt-1">Email cannot be changed</p>
                </div>

                {message && (
                    <div className={`text-sm p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-lg border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    )
}

