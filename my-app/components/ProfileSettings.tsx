'use client'

import { updateUserProfile, deleteProfileImage } from '@/actions/profile'
import { Save, Lock, Trash2, Camera, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ProfileSettingsProps {
    user: {
        UserName: string
        Email: string
        ProfileImage?: string | null
    }
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

    function handleDeleteImage() {
        toast('Are you sure you want to remove your profile photo?', {
            action: {
                label: 'Delete',
                onClick: async () => {
                    setIsLoading(true)
                    const result = await deleteProfileImage()
                    if (result?.error) {
                        toast.error(result.error)
                    } else {
                        toast.success('Profile photo removed')
                    }
                    setIsLoading(false)
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => { }
            },
        })
    }

    return (
        <div className="bg-card border border-theme rounded-xl p-6 h-full shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Account Settings
            </h3>

            <div className="mb-6 flex items-center gap-4">
                <div className="relative group">
                    {user.ProfileImage ? (
                        <div className="relative">
                            <img src={user.ProfileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/50" />
                            <button
                                onClick={handleDeleteImage}
                                disabled={isLoading}
                                className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                title="Remove photo"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center ring-2 ring-theme">
                            <Camera className="w-6 h-6 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">Profile Photo</p>
                    <p className="text-xs text-muted-foreground">Click the upload button in the header to change.</p>
                </div>
            </div>

            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={user.UserName}
                        className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                        placeholder="Enter your name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1">Email Address</label>
                    <input
                        type="email"
                        value={user.Email}
                        disabled
                        className="w-full bg-muted/50 border border-theme rounded-lg px-4 py-2.5 text-muted-foreground cursor-not-allowed opacity-70"
                    />
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Email cannot be changed</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-sm font-semibold text-muted-foreground mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50 pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-muted-foreground mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50 pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Leave blank to keep your current password.</p>

                {message && (
                    <div className={`text-sm p-3 rounded-lg font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    )
}

