import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

type TimerMode = 'work' | 'break';

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [sessions, setSessions] = useLocalStorage('pomodoro-sessions', 0);

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

  const toggleMode = () => {
    const newMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? WORK_TIME : BREAK_TIME);
    setIsRunning(false);
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
        setSessions(prev => prev + 1);
        // Play notification sound effect
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdGeBiYuJfW5qaH2DhYaEgHt2dXl/hImKh4N+eXh5foOHiYiGgn16eHl+g4eJiIaDfnp4eX6Dh4mIhoN+enl5foOHiYiGg356eXl+g4eIhoSBfnx6e36DhoaFg4B9e3t9gIKEhIOBf317fH6AgoODgoF/fXx8foGCg4KBf317fH2AgoKCgX9+fHx9gIGCgoF/fnx8fYCBgoKBf358fH2AgYKCgX9+fHx9gIGCgoE=');
        audio.play().catch(() => {});
      }
      toggleMode();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Pomodoro Timer</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {sessions} sessions completed today
          </p>
        </div>
      </div>

      <Card className="card-shadow-lg overflow-hidden">
        <div
          className={cn(
            "h-2 transition-all duration-1000",
            mode === 'work' ? "bg-timer-active" : "bg-timer-break"
          )}
          style={{ width: `${progress}%` }}
        />
        <CardContent className="pt-12 pb-10">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors",
                mode === 'work' ? "bg-timer-active/10" : "bg-timer-break/10"
              )}
            >
              {mode === 'work' ? (
                <Brain className={cn("h-8 w-8", "text-timer-active")} />
              ) : (
                <Coffee className={cn("h-8 w-8", "text-timer-break")} />
              )}
            </div>

            <div className="text-center mb-2">
              <span
                className={cn(
                  "text-sm font-medium uppercase tracking-wider",
                  mode === 'work' ? "text-timer-active" : "text-timer-break"
                )}
              >
                {mode === 'work' ? 'Focus Time' : 'Break Time'}
              </span>
            </div>

            <div
              className={cn(
                "text-7xl md:text-8xl font-light tracking-tight tabular-nums mb-8",
                isRunning && "animate-pulse-soft"
              )}
            >
              {formatTime(timeLeft)}
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={reset}
                className="h-12 w-12 rounded-full"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                  "h-16 w-16 rounded-full text-lg transition-all",
                  mode === 'work'
                    ? "bg-timer-active hover:bg-timer-active/90"
                    : "bg-timer-break hover:bg-timer-break/90"
                )}
              >
                {isRunning ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleMode}
                className="h-12 w-12 rounded-full"
              >
                {mode === 'work' ? (
                  <Coffee className="h-5 w-5" />
                ) : (
                  <Brain className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="card-shadow">
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-semibold text-timer-active">{sessions}</p>
            <p className="text-sm text-muted-foreground">Sessions Today</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-semibold text-timer-break">
              {Math.round((sessions * 25) / 60 * 10) / 10}h
            </p>
            <p className="text-sm text-muted-foreground">Focus Time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
