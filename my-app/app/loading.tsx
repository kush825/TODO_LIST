export default function Loading() {
    return (
        <div className="flex items-center justify-center w-full h-[calc(100vh-64px)]">
            <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin"></div>
            </div>
        </div>
    )
}
