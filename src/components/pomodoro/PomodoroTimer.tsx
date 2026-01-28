import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import type { PomodoroStats } from '@/types';

type TimerMode = 'work' | 'break';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  
  const today = new Date().toISOString().split('T')[0];
  const [stats, setStats] = useLocalStorage<PomodoroStats>('pomodoro-stats', { 
    sessions: 0, 
    lastReset: today 
  });

  // Reset sessions if it's a new day
  const sessions = stats.lastReset === today ? stats.sessions : 0;

  const totalTime = mode === 'work' ? WORK_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = useCallback(() => {
    setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
    setIsRunning(false);
  }, [mode]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? WORK_TIME : BREAK_TIME);
    setIsRunning(false);
  };

  const skipToNext = () => {
    if (mode === 'work') {
      setStats({ sessions: sessions + 1, lastReset: today });
      switchMode('break');
    } else {
      switchMode('work');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'work') {
        setStats({ sessions: sessions + 1, lastReset: today });
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdGeBiYuJfW5qaH2DhYaEgHt2dXl/hImKh4N+eXh5foOHiYiGgn16eHl+g4eJiIaDfnp4eX6Dh4mIhoN+enl5foOHiYiGg356eXl+g4eIhoSBfnx6e36DhoaFg4B9e3t9gIKEhIOBf317fH6AgoODgoF/fXx8foGCg4KBf317fH2AgoKCgX9+fHx9gIGCgoF/fnx8fYCBgoKBf358fH2AgYKCgX9+fHx9gIGCgoE=');
        audio.play().catch(() => {});
        switchMode('break');
      } else {
        switchMode('work');
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, sessions, today, setStats]);

  // Calculate ring progress for circular timer
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Pomodoro Timer</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Stay focused with timed work sessions
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-2">
        <Button
          variant={mode === 'work' ? 'default' : 'outline'}
          onClick={() => switchMode('work')}
          className={cn(
            "gap-2 px-6",
            mode === 'work' && "shadow-lg shadow-primary/25"
          )}
        >
          <Brain className="h-4 w-4" />
          Focus
        </Button>
        <Button
          variant={mode === 'break' ? 'default' : 'outline'}
          onClick={() => switchMode('break')}
          className={cn(
            "gap-2 px-6",
            mode === 'break' && "bg-timer-break hover:bg-timer-break/90 shadow-lg shadow-timer-break/25"
          )}
        >
          <Coffee className="h-4 w-4" />
          Break
        </Button>
      </div>

      {/* Circular Timer */}
      <Card className="card-shadow-lg max-w-md mx-auto overflow-hidden">
        <CardContent className="pt-12 pb-10">
          <div className="flex flex-col items-center">
            {/* Circular Progress */}
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/30"
                />
                {/* Progress circle */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={cn(
                    "transition-all duration-1000",
                    mode === 'work' ? "text-timer-active" : "text-timer-break"
                  )}
                />
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors",
                    mode === 'work' ? "bg-timer-active/10" : "bg-timer-break/10"
                  )}
                >
                  {mode === 'work' ? (
                    <Brain className={cn("h-7 w-7", "text-timer-active")} />
                  ) : (
                    <Coffee className={cn("h-7 w-7", "text-timer-break")} />
                  )}
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-widest mb-2",
                    mode === 'work' ? "text-timer-active" : "text-timer-break"
                  )}
                >
                  {mode === 'work' ? 'Focus Time' : 'Break Time'}
                </span>

                <div
                  className={cn(
                    "text-6xl md:text-7xl font-light tracking-tight tabular-nums",
                    isRunning && "animate-pulse-soft"
                  )}
                >
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={reset}
                className="h-14 w-14 rounded-full"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                  "h-20 w-20 rounded-full text-lg transition-all shadow-xl",
                  mode === 'work'
                    ? "bg-timer-active hover:bg-timer-active/90 shadow-timer-active/30"
                    : "bg-timer-break hover:bg-timer-break/90 shadow-timer-break/30"
                )}
              >
                {isRunning ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={skipToNext}
                className="h-14 w-14 rounded-full"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <Card className="card-shadow">
          <CardContent className="py-6 text-center">
            <p className="text-4xl font-bold text-timer-active">{sessions}</p>
            <p className="text-sm text-muted-foreground mt-1">Sessions Today</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="py-6 text-center">
            <p className="text-4xl font-bold text-timer-break">
              {Math.round((sessions * 25) / 60 * 10) / 10}h
            </p>
            <p className="text-sm text-muted-foreground mt-1">Focus Time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
