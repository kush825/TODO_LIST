import Link from "next/link";
import { CheckCircle2, Circle, MoreHorizontal, Calendar, Plus, Search, Bell } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 sm:p-12 overflow-x-hidden">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center my-auto mx-auto">

        {/* Left Column: Text Content */}
        <div className="text-left space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            Focus on what <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              matters most.
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
            Experience a task management interface designed for clarity.
            Organize, prioritize, and track your progress with our intuitive dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/auth/register"
              className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all shadow-lg shadow-purple-500/25 text-center"
            >
              Start for Free
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold ring-1 ring-white/10 transition-all text-center"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Column: High-Fidelity UI Demo */}
        <div className="relative group">
          {/* Abstract Glow Background */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

          <div className="relative bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {/* Mock Window Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/50 backdrop-blur">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex gap-4 text-slate-500">
                <Search className="w-4 h-4" />
                <Bell className="w-4 h-4" />
              </div>
            </div>

            {/* Mock Dashboard Content */}
            <div className="p-6 space-y-6 bg-slate-950/50">
              {/* Project Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">Product Launch</h3>
                  <p className="text-xs text-slate-500">Marketing Campaign Q1</p>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold ring-2 ring-slate-900 text-white">JD</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold ring-2 ring-slate-900 text-white">AL</div>
                </div>
              </div>

              {/* Kanban Column */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-medium text-slate-400 uppercase tracking-wide">
                  <span>In Progress</span>
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">3</span>
                </div>

                {/* Task Card 1 */}
                <div className="bg-white/5 border border-white/5 rounded-lg p-4 hover:border-purple-500/30 transition-colors cursor-default">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 uppercase">High</span>
                    <MoreHorizontal className="h-3 w-3 text-slate-500" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Circle className="h-4 w-4 text-slate-500 hover:text-purple-400" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-200 leading-snug">Finalize homepage copy</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">Ensure tone aligns with new brand guidelines.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pl-7 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    <span>Tomorrow</span>
                  </div>
                </div>

                {/* Task Card 2 */}
                <div className="bg-white/5 border border-white/5 rounded-lg p-4 hover:border-purple-500/30 transition-colors cursor-default">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase">Medium</span>
                    <MoreHorizontal className="h-3 w-3 text-slate-500" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="mt-0.5"><CheckCircle2 className="h-4 w-4 text-purple-400" /></div>
                    <h4 className="text-sm font-medium text-slate-300 line-through decoration-slate-600">Prepare social media assets</h4>
                  </div>
                </div>

                {/* Add Task Button */}
                <div className="border border-dashed border-white/10 rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Plus className="h-4 w-4" />
                  <span>Add Task</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

