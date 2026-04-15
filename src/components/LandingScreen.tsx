import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface LandingScreenProps {
  onStart: (goal: string) => void;
}

export function LandingScreen({ onStart }: LandingScreenProps) {
  const [goal, setGoal] = useState("");

  const handleStart = () => {
    if (goal.trim()) {
      onStart(goal);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-12"
      >
        <div className="space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200 mb-8"
          >
            <Sparkles className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Know exactly what <br /> to do next.
          </h1>
          <p className="text-xl text-slate-500 max-w-lg mx-auto leading-relaxed">
            Turn any goal into a step-by-step plan and stay focused till it’s done.
          </p>
        </div>

        <div className="relative max-w-md mx-auto group">
          <Input
            placeholder="What are you working on?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="h-16 rounded-2xl px-6 text-lg border-slate-200 shadow-sm focus-visible:ring-indigo-500 pr-32 transition-all group-hover:border-indigo-300"
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
          />
          <Button
            onClick={handleStart}
            disabled={!goal.trim()}
            className="absolute right-2 top-2 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 font-semibold"
          >
            Start <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="pt-12 flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center space-x-8 text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm font-medium uppercase tracking-widest">AI Architect</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-sm font-medium uppercase tracking-widest">Deep Focus</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
