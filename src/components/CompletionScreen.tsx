import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Flame, Target, ArrowRight, Loader2, Sparkles, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { getReflection } from "@/src/lib/gemini";
import { toast } from "sonner";

interface CompletionScreenProps {
  taskText: string;
  duration: number;
  streak: number;
  focusScore: number;
  onContinue: () => void;
}

export function CompletionScreen({ taskText, duration, streak, focusScore, onContinue }: CompletionScreenProps) {
  const [notes, setNotes] = useState("");
  const [reflection, setReflection] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReflect = async () => {
    if (!notes.trim()) return;
    setIsLoading(true);
    try {
      const res = await getReflection(notes);
      setReflection(res);
    } catch (error) {
      setReflection("Great progress. You're building a powerful focus habit.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    toast.info("Sharing feature coming soon! Screenshot this for now.");
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-20 flex flex-col items-center justify-center space-y-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Session Complete</h1>
        <p className="text-slate-500 font-medium">You finished: <span className="text-slate-900">{taskText}</span></p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <p className="text-2xl font-bold text-slate-900">{streak} Days</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Streak</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <Target className="w-6 h-6 text-indigo-500" />
            <p className="text-2xl font-bold text-slate-900">{focusScore}/100</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Focus Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">What did you get done?</p>
          <div className="relative">
            <Input
              placeholder="Quick reflection..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-14 rounded-2xl border-slate-200 focus-visible:ring-indigo-500 pr-32"
              onKeyDown={(e) => e.key === "Enter" && handleReflect()}
            />
            <Button
              onClick={handleReflect}
              disabled={isLoading || !notes.trim() || !!reflection}
              className="absolute right-1.5 top-1.5 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 px-4"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reflect"}
            </Button>
          </div>
        </div>

        {reflection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100"
          >
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-indigo-900 text-sm leading-relaxed italic">
                {reflection}
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col space-y-3">
          <Button
            onClick={onContinue}
            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-lg shadow-indigo-100"
          >
            Continue to Next Step <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-semibold"
          >
            <Share2 className="w-4 h-4 mr-2" /> Share Progress
          </Button>
        </div>
      </div>
    </div>
  );
}
