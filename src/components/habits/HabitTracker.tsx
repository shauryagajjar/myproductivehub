import { useState } from 'react';
import { Plus, Trash2, Flame, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import type { Habit } from '@/types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Habit Tracker</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {completedToday} of {habits.length} completed today
          </p>
        </div>
      </div>

      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              placeholder="Add a new habit..."
              value={newHabit}
              onChange={e => setNewHabit(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHabit()}
              className="flex-1"
            />
            <Button onClick={addHabit}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {habits.length === 0 ? (
        <Card className="card-shadow">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No habits yet. Add one above!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {habits.map((habit, index) => {
            const streak = getStreak(habit);

            return (
              <Card
                key={habit.id}
                className="card-shadow hover-lift"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{habit.name}</h3>
                      {streak > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10">
                          <Flame className="h-3 w-3 text-warning" />
                          <span className="text-xs font-medium text-warning">
                            {streak} day{streak !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
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

                  <div className="flex items-center justify-between gap-2">
                    {last7Days.map(day => {
                      const isCompleted = habit.completedDates.includes(day.date);

                      return (
                        <div key={day.date} className="flex flex-col items-center gap-2">
                          <span
                            className={cn(
                              "text-xs",
                              day.isToday ? "font-semibold text-primary" : "text-muted-foreground"
                            )}
                          >
                            {day.dayName}
                          </span>
                          <button
                            onClick={() => toggleHabit(habit.id, day.date)}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              isCompleted
                                ? "bg-streak-active text-primary-foreground"
                                : "bg-streak-inactive hover:bg-streak-active/30",
                              day.isToday && !isCompleted && "ring-2 ring-primary ring-offset-2"
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
