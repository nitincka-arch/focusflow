import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Play, Loader2, ChevronUp, ChevronDown, Flag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "@/src/types";

interface PlanningScreenProps {
  goal: string;
  tasks: Task[];
  onStartStep: (index: number) => void;
  onCancel: () => void;
  onUseDefault: () => void;
  onUpdateTasks: (tasks: Task[]) => void;
  isLoading: boolean;
}

export function PlanningScreen({ goal, tasks, onStartStep, onCancel, onUseDefault, onUpdateTasks, isLoading }: PlanningScreenProps) {
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => setShowSkip(true), 6000);
    } else {
      setShowSkip(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleMoveTask = (index: number, direction: 'up' | 'down') => {
    const newTasks = [...tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;
    
    [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
    onUpdateTasks(newTasks);
  };

  const handlePriorityChange = (index: number, priority: 'high' | 'medium' | 'low') => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], priority };
    onUpdateTasks(newTasks);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'medium': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'low': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 py-20 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="rounded-full px-4 py-1 bg-indigo-50 text-indigo-600 border-indigo-100 uppercase tracking-widest text-[10px] font-bold">
            The Plan
          </Badge>
          {!isLoading && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
              Cancel
            </Button>
          )}
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{goal}</h1>
        <p className="text-slate-500 font-medium italic">“Don’t think. Start with this.”</p>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Architecting your path...</p>
          </div>
          
          <AnimatePresence>
            {showSkip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center space-y-4"
              >
                <p className="text-xs text-slate-400 max-w-xs text-center">
                  AI is taking a moment to think. You can wait or use a standard focus plan.
                </p>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" onClick={onUseDefault} className="rounded-full px-6">
                    Use Default Plan
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-400">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Button 
                onClick={() => onStartStep(0)}
                className="w-full h-20 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-xl font-bold shadow-xl shadow-indigo-100 group"
              >
                Start Step 1: {tasks[0].text}
                <Play className="w-6 h-6 ml-3 fill-current group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center p-6 rounded-2xl border transition-all duration-300 ${
                  index === 0 
                    ? "bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50" 
                    : "bg-white/50 border-slate-100 opacity-80"
                }`}
              >
                <div className="flex flex-col items-center mr-4 space-y-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md text-slate-300 hover:text-indigo-600 disabled:opacity-0"
                    onClick={() => handleMoveTask(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    {index + 1}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md text-slate-300 hover:text-indigo-600 disabled:opacity-0"
                    onClick={() => handleMoveTask(index, 'down')}
                    disabled={index === tasks.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`font-semibold ${index === 0 ? "text-slate-900" : "text-slate-500"}`}>
                      {task.text}
                    </h3>
                    <div className={`flex items-center px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                      <Flag className="w-2.5 h-2.5 mr-1 fill-current" />
                      {task.priority}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      {task.duration} Minutes
                    </p>
                    <div className="flex items-center space-x-1">
                      {(['high', 'medium', 'low'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => handlePriorityChange(index, p)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            task.priority === p 
                              ? (p === 'high' ? 'bg-rose-500 scale-125' : p === 'medium' ? 'bg-amber-500 scale-125' : 'bg-emerald-500 scale-125')
                              : 'bg-slate-200 hover:bg-slate-300'
                          }`}
                          title={`Set to ${p} priority`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant={index === 0 ? "default" : "ghost"}
                  size="sm" 
                  className={`rounded-full ${
                    index === 0 
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                      : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                  onClick={() => onStartStep(index)}
                >
                  {index === 0 ? "Start Now" : "Start"}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
