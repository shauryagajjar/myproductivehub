import { useState } from 'react';
import { Plus, Trash2, Flame, Check, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import type { Habit } from '@/types';

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const FULL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitTracker() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('productivity-habits', []);
  const [newHabit, setNewHabit] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: DAYS_OF_WEEK[date.getDay()],
        fullDay: FULL_DAYS[date.getDay()],
        isToday: i === 0,
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  const addHabit = () => {
    if (!newHabit.trim()) return;

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: newHabit.trim(),
      completedDates: [],
    };

    setHabits(prev => [...prev, habit]);
    setNewHabit('');
  };

  const toggleHabit = (habitId: string, date: string) => {
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== habitId) return habit;

        const isCompleted = habit.completedDates.includes(date);
        return {
          ...habit,
          completedDates: isCompleted
            ? habit.completedDates.filter(d => d !== date)
            : [...habit.completedDates, date],
        };
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  };

  const getStreak = (habit: Habit) => {
    let streak = 0;
    const sortedDates = [...habit.completedDates].sort().reverse();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (sortedDates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const getCompletionRate = (habit: Habit) => {
    const last7 = last7Days.map(d => d.date);
    const completed = last7.filter(date => habit.completedDates.includes(date)).length;
    return Math.round((completed / 7) * 100);
  };

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const todayProgress = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Habit Tracker</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Build consistency, one day at a time
          </p>
        </div>
      </div>

      {/* Today's Progress */}
      {habits.length > 0 && (
        <Card className="card-shadow-lg bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Today's Progress</p>
                  <p className="text-sm text-muted-foreground">
                    {completedToday} of {habits.length} habits completed
                  </p>
                </div>
              </div>
              <span className="text-3xl font-bold text-primary">{todayProgress}%</span>
            </div>
            <Progress value={todayProgress} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Add Habit */}
      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              placeholder="Add a new habit..."
              value={newHabit}
              onChange={e => setNewHabit(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHabit()}
              className="flex-1 h-12"
            />
            <Button onClick={addHabit} size="lg" className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-5 w-5" />
              Add Habit
            </Button>
          </div>
        </CardContent>
      </Card>

      {habits.length === 0 ? (
        <Card className="card-shadow border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Flame className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-medium">No habits yet</p>
            <p className="text-sm mt-1">Add a habit above to start tracking</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {habits.map((habit, index) => {
            const streak = getStreak(habit);
            const completionRate = getCompletionRate(habit);
            const isCompletedToday = habit.completedDates.includes(today);

            return (
              <Card
                key={habit.id}
                className={cn(
                  "card-shadow hover-lift overflow-hidden",
                  isCompletedToday && "border-success/30 bg-success/5"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabit(habit.id, today)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          isCompletedToday
                            ? "bg-success text-success-foreground"
                            : "bg-muted hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        {isCompletedToday ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Plus className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-semibold">{habit.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          {streak > 0 && (
                            <div className="flex items-center gap-1">
                              <Flame className="h-4 w-4 text-warning" />
                              <span className="text-sm font-medium text-warning">
                                {streak} day streak
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {completionRate}% this week
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHabit(habit.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Weekly view */}
                  <div className="flex items-center justify-between gap-1 sm:gap-2 px-1">
                    {last7Days.map(day => {
                      const isCompleted = habit.completedDates.includes(day.date);

                      return (
                        <div key={day.date} className="flex flex-col items-center gap-2 flex-1">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              day.isToday ? "text-primary" : "text-muted-foreground"
                            )}
                          >
                            {day.dayName}
                          </span>
                          <button
                            onClick={() => toggleHabit(habit.id, day.date)}
                            className={cn(
                              "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all",
                              isCompleted
                                ? "bg-streak-active text-primary-foreground shadow-md shadow-primary/20"
                                : "bg-streak-inactive hover:bg-streak-active/30",
                              day.isToday && !isCompleted && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            )}
                          >
                            {isCompleted && <Check className="h-4 w-4" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
