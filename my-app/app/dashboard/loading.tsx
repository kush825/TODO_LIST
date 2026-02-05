export default function DashboardLoading() {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[calc(100vh-4rem)]">
            <div className="relative h-10 w-10">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin"></div>
            </div>
        </div>
    )
}
