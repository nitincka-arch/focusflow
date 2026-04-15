import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pause, Play, X, Brain, Search, Loader2, BookOpen, History, Trash2, Clock, Undo2, Redo2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { focusedSearch } from "@/src/lib/gemini";
import Markdown from "react-markdown";
import { SearchHistoryItem } from "@/src/types";

interface FocusScreenProps {
  taskText: string;
  stepNumber: number;
  totalSteps: number;
  duration: number; // in minutes
  onComplete: () => void;
  onCancel: () => void;
}

export function FocusScreen({ taskText, stepNumber, totalSteps, duration, onComplete, onCancel }: FocusScreenProps) {
  // timeLeft: Remaining seconds in the focus session
  const [timeLeft, setTimeLeft] = useState(() => {
    const d = Number(duration);
    return isNaN(d) ? 25 * 60 : d * 60;
  });
  // isActive: Whether the timer is currently running
  const [isActive, setIsActive] = useState(true);
  // activeNudge: The current motivational message being displayed
  const [activeNudge, setActiveNudge] = useState<string | null>(null);
  const nudgePlayed = useRef<Record<string, boolean>>({});

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('focusflow_search_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [historyFilter, setHistoryFilter] = useState("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [undoStack, setUndoStack] = useState<SearchHistoryItem[][]>([]);
  const [redoStack, setRedoStack] = useState<SearchHistoryItem[][]>([]);

  // Initialize and clean up on unmount
  useEffect(() => {
    return () => {
      // Cleanup logic if any
    };
  }, []);

  // Persistence Effect for Search History
  useEffect(() => {
    localStorage.setItem('focusflow_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Main timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Trigger completion callback when time runs out
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft === 0, onComplete]);

  // AI-powered "Voice Nudges"
  // Triggers motivational spoken messages at specific intervals (50%, 75%, 1m left, 10s left)
  useEffect(() => {
    if (!isActive) return;

    const totalSeconds = duration * 60;
    const halfWay = Math.floor(totalSeconds / 2);
    const quarterWay = Math.floor(totalSeconds * 0.75);
    const almostDone = 60; // 1 minute left
    const finalPush = 10; // 10 seconds left

    const triggerNudge = (id: string, message: string) => {
      if (nudgePlayed.current[id]) return;
      setActiveNudge(message);
      nudgePlayed.current[id] = true;
      setTimeout(() => setActiveNudge(null), 5000);
    };

    if (timeLeft === halfWay) {
      triggerNudge('half', "You're halfway there. Keep going.");
    } else if (timeLeft === quarterWay) {
      triggerNudge('quarter', "Stay with it. You're doing great.");
    } else if (timeLeft === almostDone) {
      triggerNudge('almost', "Almost there. Don't break focus now.");
    } else if (timeLeft === finalPush) {
      triggerNudge('final', "Final push! Finish strong.");
    }
  }, [timeLeft, isActive, duration]);

  const handleSearch = async (queryOverride?: string) => {
    const query = queryOverride || searchQuery;
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults(null);
    if (!queryOverride) setSearchQuery(query);

    try {
      const results = await focusedSearch(query, taskText);
      setSearchResults(results);
      
      // Save to history
      const newHistoryItem: SearchHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        query: query.trim(),
        timestamp: Date.now(),
        context: taskText
      };
      
      setSearchHistory(prev => {
        // Clear redo stack on new search
        setRedoStack([]);
        // Remove duplicate queries to keep it clean
        const filtered = prev.filter(item => item.query.toLowerCase() !== query.trim().toLowerCase());
        return [newHistoryItem, ...filtered].slice(0, 20); // Keep last 20
      });
    } catch (error) {
      setSearchResults("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearHistory = () => {
    if (searchHistory.length === 0) return;
    setUndoStack(prev => [...prev, searchHistory]);
    setRedoStack([]);
    setSearchHistory([]);
  };

  const undoHistoryAction = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, searchHistory]);
    setSearchHistory(previous);
  };

  const redoHistoryAction = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, searchHistory]);
    setSearchHistory(next);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-between py-20 px-6 text-white overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 z-10"
      >
        <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-xs">
          Step {stepNumber} of {totalSteps}
        </p>
        <h2 className="text-2xl font-medium text-slate-200">{taskText}</h2>
      </motion.div>

      {/* Focus Search Trigger */}
      <div className="absolute top-6 left-6 z-[60]">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-12 h-12 text-white/40 hover:text-white hover:bg-white/10"
          onClick={() => setIsSearchOpen(true)}
          title="Focus Search"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>

      {/* Focus Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh] shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Focus Search</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Context: {taskText}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-white/5 text-white/40 hover:text-white"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                    setSearchResults(null);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="relative">
                  <Input
                    placeholder="Search for knowledge related to this task..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-lg focus-visible:ring-indigo-500 pr-16"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button
                    size="icon"
                    disabled={!searchQuery.trim() || isSearching}
                    onClick={() => handleSearch()}
                    className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {isSearching ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 flex flex-col items-center justify-center space-y-4"
                    >
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                      <p className="text-white/40 text-sm font-medium animate-pulse">Filtering knowledge for your focus...</p>
                    </motion.div>
                  ) : searchResults ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="prose prose-invert max-w-none"
                    >
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                        <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                          <Markdown>
                            {searchResults}
                          </Markdown>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-8">
                      {searchHistory.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-white/40">
                              <History className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-widest">Recent Searches</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={undoHistoryAction}
                                disabled={undoStack.length === 0}
                                className="h-8 w-8 text-white/20 hover:text-white disabled:opacity-0 transition-opacity"
                                title="Undo"
                              >
                                <Undo2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={redoHistoryAction}
                                disabled={redoStack.length === 0}
                                className="h-8 w-8 text-white/20 hover:text-white disabled:opacity-0 transition-opacity"
                                title="Redo"
                              >
                                <Redo2 className="w-4 h-4" />
                              </Button>
                              <div className="w-[1px] h-4 bg-white/10 mx-1" />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={clearHistory}
                                className="h-8 text-[10px] text-white/20 hover:text-red-400 hover:bg-red-400/10 uppercase tracking-widest font-bold"
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Clear
                              </Button>
                            </div>
                          </div>

                          {/* History Filter */}
                          <div className="space-y-3">
                            <div className="relative">
                              <Input
                                placeholder="Filter history..."
                                value={historyFilter}
                                onChange={(e) => setHistoryFilter(e.target.value)}
                                className="h-10 bg-white/5 border-white/5 rounded-xl px-4 text-sm focus-visible:ring-indigo-500/50"
                              />
                              {historyFilter && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setHistoryFilter("")}
                                  className="absolute right-1 top-1 h-8 w-8 text-white/20 hover:text-white"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                                <Input
                                  type="date"
                                  value={dateRange.start}
                                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                  className="h-9 bg-white/5 border-white/5 rounded-xl pl-8 pr-2 text-[10px] focus-visible:ring-indigo-500/50 text-white/60"
                                />
                              </div>
                              <span className="text-white/20 text-[10px] font-bold">TO</span>
                              <div className="relative flex-1">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                                <Input
                                  type="date"
                                  value={dateRange.end}
                                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                  className="h-9 bg-white/5 border-white/5 rounded-xl pl-8 pr-2 text-[10px] focus-visible:ring-indigo-500/50 text-white/60"
                                />
                              </div>
                              {(dateRange.start || dateRange.end) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDateRange({ start: "", end: "" })}
                                  className="h-8 w-8 text-white/20 hover:text-white"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {searchHistory
                              .filter(item => {
                                const matchesText = item.query.toLowerCase().includes(historyFilter.toLowerCase());
                                const itemDate = new Date(item.timestamp);
                                itemDate.setHours(0, 0, 0, 0);
                                
                                let matchesDate = true;
                                if (dateRange.start) {
                                  const startDate = new Date(dateRange.start);
                                  startDate.setHours(0, 0, 0, 0);
                                  matchesDate = matchesDate && itemDate >= startDate;
                                }
                                if (dateRange.end) {
                                  const endDate = new Date(dateRange.end);
                                  endDate.setHours(0, 0, 0, 0);
                                  matchesDate = matchesDate && itemDate <= endDate;
                                }
                                
                                return matchesText && matchesDate;
                              })
                              .map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleSearch(item.query)}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
                              >
                                <div className="flex items-center space-x-3 overflow-hidden">
                                  <Clock className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                                  <span className="text-sm text-slate-300 truncate">{item.query}</span>
                                </div>
                                <span className="text-[10px] text-white/20 font-mono flex-shrink-0 ml-4">
                                  {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </button>
                            ))}
                            {searchHistory.filter(item => {
                              const matchesText = item.query.toLowerCase().includes(historyFilter.toLowerCase());
                              const itemDate = new Date(item.timestamp);
                              itemDate.setHours(0, 0, 0, 0);
                              
                              let matchesDate = true;
                              if (dateRange.start) {
                                const startDate = new Date(dateRange.start);
                                startDate.setHours(0, 0, 0, 0);
                                matchesDate = matchesDate && itemDate >= startDate;
                              }
                              if (dateRange.end) {
                                const endDate = new Date(dateRange.end);
                                endDate.setHours(0, 0, 0, 0);
                                matchesDate = matchesDate && itemDate <= endDate;
                              }
                              
                              return matchesText && matchesDate;
                            }).length === 0 && (
                              <div className="py-8 text-center">
                                <p className="text-white/20 text-xs italic">No matching history items found.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="py-12 text-center space-y-2">
                        <p className="text-white/20 text-sm">Ask anything related to your current step.</p>
                        <p className="text-[10px] text-white/10 uppercase tracking-widest font-bold">Results are restricted to keep you focused.</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center space-y-12">
        <motion.div
          key={timeLeft}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[12rem] sm:text-[16rem] font-mono font-medium tracking-tighter leading-none"
        >
          {formatTime(timeLeft)}
        </motion.div>
        
        <AnimatePresence>
          {activeNudge && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-[60%] bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center space-x-3"
            >
              <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-indigo-200 font-medium tracking-wide italic">
                {activeNudge}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex flex-col items-center space-y-8">
          <div className="flex items-center space-x-6">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-20 h-20 border-white/10 bg-white/5 hover:bg-white/10 text-white"
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-16 border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold"
              onClick={onCancel}
            >
              End Session
            </Button>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center z-10"
      >
        <p className="text-slate-500 font-medium tracking-wide">
          “You’re doing better than yesterday”
        </p>
      </motion.div>
    </div>
  );
}
