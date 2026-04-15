import { useState, useEffect } from "react";
import { LandingScreen } from "@/src/components/LandingScreen";
import { PlanningScreen } from "@/src/components/PlanningScreen";
import { FocusScreen } from "@/src/components/FocusScreen";
import { CompletionScreen } from "@/src/components/CompletionScreen";
import { DashboardScreen } from "@/src/components/DashboardScreen";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { AppState, SessionData, Task } from "@/src/types";
import { breakdownTask } from "@/src/lib/gemini";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

const STORAGE_KEYS = {
  STATE: 'focusflow_state',
  SESSION: 'focusflow_session'
};

// FocusFlow: A productivity app for deep work.
// Architected by AI for maximum efficiency.
// This is the main application controller that manages the global state,
// persistence, and transitions between different screens.
export default function App() {
  // state: Controls which screen is currently visible (landing, planning, focusing, etc.)
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === 'undefined') return 'landing';
    const saved = localStorage.getItem(STORAGE_KEYS.STATE);
    const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    const sessionData = savedSession ? JSON.parse(savedSession) : null;
    
    // Don't resume in 'planning' or 'focusing' directly to avoid weird states
    if (saved === 'planning' || saved === 'focusing') return 'dashboard';
    
    // Ensure we have tasks if we are in a state that requires them
    if ((saved === 'dashboard' || saved === 'completed') && (!sessionData || !sessionData.tasks || sessionData.tasks.length === 0)) {
      return 'landing';
    }
    
    return (saved as AppState) || 'landing';
  });

  const [session, setSession] = useState<SessionData>(() => {
    if (typeof window === 'undefined') return {
      goal: '',
      tasks: [],
      currentTaskIndex: 0,
      streak: 3,
      focusScore: 84,
      totalFocusTime: 0
    };
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    return saved ? JSON.parse(saved) : {
      goal: '',
      tasks: [],
      currentTaskIndex: 0,
      streak: 3,
      focusScore: 84,
      totalFocusTime: 0
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATE, state);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }, [state, session]);

  // handleStartGoal: Triggered when a user submits a new goal.
  // It calls the Gemini API to break down the task.
  const handleStartGoal = async (goal: string) => {
    setSession(prev => ({ ...prev, goal, tasks: [], currentTaskIndex: 0 }));
    setState('planning');
    setIsLoading(true);
    
    try {
      // Call the AI architect to break the goal into actionable steps
      const steps = await breakdownTask(goal);
      const tasks: Task[] = steps.map((s) => ({
        id: Math.random().toString(36).substr(2, 9),
        text: s.text,
        duration: s.duration,
        completed: false,
        priority: s.priority
      }));
      setSession(prev => ({ ...prev, tasks }));
    } catch (error) {
      console.error("Planning error:", error);
      toast.error("AI Architect is busy. Using a default plan.");
      handleUseDefaultPlan();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDefaultPlan = () => {
    const defaultSteps: { text: string; duration: number; priority: 'high' | 'medium' | 'low' }[] = [
      { text: "Break the goal into smaller pieces", duration: 15, priority: 'high' },
      { text: "Focus on the most important first step", duration: 25, priority: 'high' },
      { text: "Take a short break to recharge", duration: 5, priority: 'medium' },
      { text: "Review progress and adjust plan", duration: 10, priority: 'low' }
    ];
    const tasks: Task[] = defaultSteps.map((s) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: s.text,
      duration: s.duration,
      completed: false,
      priority: s.priority
    }));
    setSession(prev => ({ ...prev, tasks }));
    setIsLoading(false);
  };

  const handleStartStep = (index: number) => {
    setSession(prev => ({ ...prev, currentTaskIndex: index }));
    setState('focusing');
  };

  const handleSessionComplete = () => {
    if (!session.tasks[session.currentTaskIndex]) {
      setState('dashboard');
      return;
    }
    
    const updatedTasks = [...session.tasks];
    updatedTasks[session.currentTaskIndex].completed = true;
    
    setSession(prev => ({
      ...prev,
      tasks: updatedTasks,
      totalFocusTime: prev.totalFocusTime + (updatedTasks[prev.currentTaskIndex]?.duration || 0)
    }));
    
    setState('completed');
  };

  const handleContinue = () => {
    const nextIndex = session.currentTaskIndex + 1;
    if (nextIndex < session.tasks.length) {
      setSession(prev => ({ ...prev, currentTaskIndex: nextIndex }));
      setState('dashboard');
    } else {
      toast.success("Goal achieved! Time for a new one.");
      setState('landing');
    }
  };

  const handleReset = () => {
    localStorage.clear();
    toast.success("All progress has been reset.");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <Toaster position="top-center" />
      
      {/* Global Controls */}
      <div className="fixed top-6 right-6 z-[60] flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full w-12 h-12 ${state === 'focusing' ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          onClick={handleReset}
          title="Reset All Progress"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
      
      {state === 'landing' && <LandingScreen onStart={handleStartGoal} />}
      
      {state === 'dashboard' && session.tasks[session.currentTaskIndex] && (
        <DashboardScreen 
          goal={session.goal}
          currentTask={session.tasks[session.currentTaskIndex]}
          streak={session.streak}
          onStart={() => setState('focusing')}
          onNewGoal={() => setState('landing')}
        />
      )}
      
      {state === 'planning' && (
        <PlanningScreen 
          goal={session.goal} 
          tasks={session.tasks} 
          isLoading={isLoading} 
          onStartStep={handleStartStep} 
          onCancel={() => setState('landing')}
          onUseDefault={handleUseDefaultPlan}
          onUpdateTasks={(tasks) => setSession(prev => ({ ...prev, tasks }))}
        />
      )}
      
      {state === 'focusing' && session.tasks[session.currentTaskIndex] && (
        <FocusScreen 
          taskText={session.tasks[session.currentTaskIndex].text}
          stepNumber={session.currentTaskIndex + 1}
          totalSteps={session.tasks.length}
          duration={session.tasks[session.currentTaskIndex].duration}
          onComplete={handleSessionComplete}
          onCancel={() => setState('dashboard')}
        />
      )}
      
      {state === 'completed' && session.tasks[session.currentTaskIndex] && (
        <CompletionScreen 
          taskText={session.tasks[session.currentTaskIndex].text}
          duration={session.tasks[session.currentTaskIndex].duration}
          streak={session.streak}
          focusScore={session.focusScore}
          onContinue={handleContinue}
        />
      )}

      {/* Background Accents */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-50/50 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
