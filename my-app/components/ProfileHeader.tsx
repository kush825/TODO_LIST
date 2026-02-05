'use client'

import { Mail, Edit2, User, Camera, Loader2 } from 'lucide-react'
import { useState, useRef } from 'react'
import { uploadProfileImage } from '@/actions/profile'
import { useRouter } from 'next/navigation'

interface ProfileHeaderProps {
    user: {
        UserName: string
        Email: string
        ProfileImage?: string | null
    }
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0]) return

        setIsUploading(true)
        const file = e.target.files[0]
        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadProfileImage(formData)

        if (result?.success) {
            router.refresh()
        }

        setIsUploading(false)
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-card border border-theme p-6 sm:p-10 mb-8 shadow-sm">
            <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-20 pointer-events-none">
                <User className="w-64 h-64 text-primary transform rotate-12 translate-x-16 -translate-y-16" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative group">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-xl ring-4 ring-card overflow-hidden">
                        {user.ProfileImage ? (
                            <img src={user.ProfileImage} alt={user.UserName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-white">
                                {user.UserName.substring(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                            <Camera className="w-6 h-6 text-white" />
                        )}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                </div>

                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{user.UserName}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium">{user.Email}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    {/* Edit Profile Logic is usually handled in the settings form now, but we can keep a button if needed */}
                </div>
            </div>
        </div>
    )
}
