import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Flame, Clock, Target, Flag } from "lucide-react";
import { motion } from "motion/react";
import { Task } from "@/src/types";

interface DashboardScreenProps {
  goal: string;
  currentTask: Task;
  streak: number;
  onStart: () => void;
  onNewGoal: () => void;
}

export function DashboardScreen({ goal, currentTask, streak, onStart, onNewGoal }: DashboardScreenProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'low': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-20 flex flex-col justify-center space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 text-center"
      >
        <p className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-xs">Current Goal</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{goal}</h1>
      </motion.div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-indigo-100/50 bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Next Action</p>
              <div className="flex items-center space-x-3">
                <div className={`flex items-center px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getPriorityColor(currentTask.priority)}`}>
                  <Flag className="w-2.5 h-2.5 mr-1 fill-current" />
                  {currentTask.priority}
                </div>
                <div className="flex items-center space-x-1 text-emerald-500 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{currentTask.duration}m</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800">{currentTask.text}</h2>
          </div>

          <Button 
            onClick={onStart}
            className="w-full h-20 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-xl font-bold shadow-xl shadow-indigo-100 group"
          >
            Start Focus Session
            <Play className="w-6 h-6 ml-3 fill-current group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center space-x-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{streak} Days</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Streak</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">12.5h</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weekly Hours</p>
          </div>
        </div>
      </div>

      <Button 
        variant="ghost" 
        onClick={onNewGoal}
        className="text-slate-400 hover:text-indigo-600 font-semibold"
      >
        Set a new goal
      </Button>
    </div>
  );
}
