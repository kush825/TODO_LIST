export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] w-full py-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="relative z-10 w-full max-w-md p-4 my-auto mx-auto">
                {children}
            </div>
        </div>
    )
}
