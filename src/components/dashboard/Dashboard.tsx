import { 
  CheckCircle2, 
  Clock, 
  Target, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Flame,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import type { Task, Note, Habit, PomodoroStats, Section } from '@/types';

interface DashboardProps {
  onNavigate: (section: Section) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [tasks] = useLocalStorage<Task[]>('productivity-tasks', []);
  const [notes] = useLocalStorage<Note[]>('productivity-notes', []);
  const [habits] = useLocalStorage<Habit[]>('productivity-habits', []);
  const [pomodoroStats] = useLocalStorage<PomodoroStats>('pomodoro-stats', { 
    sessions: 0, 
    lastReset: new Date().toISOString().split('T')[0] 
  });

  const today = new Date().toISOString().split('T')[0];

  // Reset pomodoro if it's a new day
  const sessions = pomodoroStats.lastReset === today ? pomodoroStats.sessions : 0;

  // Task stats
  const todaysTasks = tasks.filter(t => t.dueDate === today);
  const completedToday = todaysTasks.filter(t => t.completed).length;
  const overdueTasks = tasks.filter(t => 
    t.dueDate && !t.completed && isPast(parseISO(t.dueDate)) && t.dueDate < today
  );
  const upcomingTasks = tasks.filter(t => 
    t.dueDate && !t.completed && t.dueDate >= today
  ).slice(0, 5);

  // Habit stats
  const habitsCompletedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const habitProgress = habits.length > 0 
    ? Math.round((habitsCompletedToday / habits.length) * 100) 
    : 0;

  // Recent notes
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // Calculate longest streak
  const getLongestStreak = () => {
    let maxStreak = 0;
    habits.forEach(habit => {
      let streak = 0;
      const sortedDates = [...habit.completedDates].sort().reverse();
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        if (sortedDates.includes(dateStr)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      if (streak > maxStreak) maxStreak = streak;
    });
    return maxStreak;
  };

  const longestStreak = getLongestStreak();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-8 text-primary-foreground">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium opacity-90">
              {format(new Date(), 'EEEE, MMMM d')}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {getGreeting()}! 👋
          </h1>
          <p className="text-primary-foreground/80 max-w-md">
            {todaysTasks.length > 0 
              ? `You have ${todaysTasks.length} task${todaysTasks.length > 1 ? 's' : ''} due today. Let's make it a productive day!`
              : "No tasks due today. Time to focus on what matters most!"}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="card-shadow hover-lift cursor-pointer group"
          onClick={() => onNavigate('tasks')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold">{completedToday}/{todaysTasks.length}</p>
            <p className="text-sm text-muted-foreground">Tasks today</p>
          </CardContent>
        </Card>

        <Card 
          className="card-shadow hover-lift cursor-pointer group"
          onClick={() => onNavigate('pomodoro')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-timer-active/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-timer-active" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold">{sessions}</p>
            <p className="text-sm text-muted-foreground">Focus sessions</p>
          </CardContent>
        </Card>

        <Card 
          className="card-shadow hover-lift cursor-pointer group"
          onClick={() => onNavigate('habits')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-success" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold">{habitsCompletedToday}/{habits.length}</p>
            <p className="text-sm text-muted-foreground">Habits done</p>
          </CardContent>
        </Card>

        <Card 
          className="card-shadow hover-lift cursor-pointer group"
          onClick={() => onNavigate('habits')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="h-6 w-6 text-warning" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold">{longestStreak}</p>
            <p className="text-sm text-muted-foreground">Best streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <Card className="lg:col-span-2 card-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('tasks')}
              className="text-muted-foreground hover:text-foreground"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueTasks.length > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
              </div>
            )}
            
            {upcomingTasks.length === 0 && overdueTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No upcoming tasks</p>
                <p className="text-sm">Add due dates to your tasks to see them here</p>
              </div>
            ) : (
              upcomingTasks.map(task => (
                <div 
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors",
                    task.dueDate === today && "bg-primary/5 border border-primary/20"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    task.priority === 'high' && "bg-priority-high",
                    task.priority === 'medium' && "bg-priority-medium",
                    task.priority === 'low' && "bg-priority-low"
                  )} />
                  <span className="flex-1 font-medium truncate">{task.title}</span>
                  {task.dueDate && (
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      task.dueDate === today 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground"
                    )}>
                      {task.dueDate === today ? 'Today' : format(parseISO(task.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Habit Progress */}
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Today's Habits</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('habits')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">{habitProgress}%</span>
              </div>
              <Progress value={habitProgress} className="h-3" />
            </div>

            {habits.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <p>No habits yet</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => onNavigate('habits')}
                  className="mt-1"
                >
                  Add your first habit
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {habits.slice(0, 5).map(habit => {
                  const isCompleted = habit.completedDates.includes(today);
                  return (
                    <div 
                      key={habit.id}
                      className="flex items-center gap-3 p-2 rounded-lg"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isCompleted 
                          ? "bg-success border-success" 
                          : "border-muted-foreground/30"
                      )}>
                        {isCompleted && (
                          <CheckCircle2 className="h-3 w-3 text-success-foreground" />
                        )}
                      </div>
                      <span className={cn(
                        "flex-1 text-sm",
                        isCompleted && "line-through text-muted-foreground"
                      )}>
                        {habit.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Notes */}
      <Card className="card-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Recent Notes</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('notes')}
            className="text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No notes yet</p>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => onNavigate('notes')}
                className="mt-1"
              >
                Create your first note
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4">
              {recentNotes.map(note => (
                <div 
                  key={note.id}
                  className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => onNavigate('notes')}
                >
                  <h4 className="font-medium truncate mb-1">{note.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {note.content || 'No content'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
