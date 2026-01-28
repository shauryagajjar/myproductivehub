import { useState } from 'react';
import { Plus, Trash2, Check, Flag, Calendar, ChevronDown, AlertCircle } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import type { Task, Priority } from '@/types';

const priorityConfig = {
  high: { label: 'High', color: 'text-priority-high', bg: 'bg-priority-high/10', border: 'border-l-priority-high' },
  medium: { label: 'Medium', color: 'text-priority-medium', bg: 'bg-priority-medium/10', border: 'border-l-priority-medium' },
  low: { label: 'Low', color: 'text-priority-low', bg: 'bg-priority-low/10', border: 'border-l-priority-low' },
};

export function TaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('productivity-tasks', []);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.trim(),
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
      dueDate: dueDate?.toISOString().split('T')[0],
    };

    setTasks(prev => [task, ...prev]);
    setNewTask('');
    setDueDate(undefined);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const updateTaskDueDate = (id: string, date: Date | undefined) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, dueDate: date?.toISOString().split('T')[0] } : task
      )
    );
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return isPast(parseISO(task.dueDate)) && task.dueDate < today;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    if (filter === 'overdue') return isOverdue(task);
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Overdue first, then by due date, then by priority
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const overdueCount = tasks.filter(isOverdue).length;

  const formatDueDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {completedCount} of {tasks.length} completed
            {overdueCount > 0 && (
              <span className="text-destructive ml-2">• {overdueCount} overdue</span>
            )}
          </p>
        </div>
      </div>

      <Card className="card-shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
        <CardContent className="pt-6 pb-5">
          <div className="flex gap-3 flex-col">
            <Input
              placeholder="What needs to be done?"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              className="text-base h-12 bg-background/50"
            />
            <div className="flex gap-2 flex-wrap items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Flag className={cn("h-3 w-3", priorityConfig[priority].color)} />
                    {priorityConfig[priority].label}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-popover">
                  {(['high', 'medium', 'low'] as Priority[]).map(p => (
                    <DropdownMenuItem
                      key={p}
                      onClick={() => setPriority(p)}
                      className="gap-2"
                    >
                      <Flag className={cn("h-3 w-3", priorityConfig[p].color)} />
                      {priorityConfig[p].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="h-3 w-3" />
                    {dueDate ? format(dueDate, 'MMM d') : 'Due date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <div className="flex-1" />

              <Button onClick={addTask} className="gap-2 shadow-lg shadow-primary/25">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'active', 'completed', 'overdue'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(f)}
            className={cn(
              "capitalize shrink-0",
              filter === f && "shadow-md"
            )}
          >
            {f}
            {f === 'overdue' && overdueCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive">
                {overdueCount}
              </span>
            )}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <Card className="card-shadow border-dashed">
            <CardContent className="py-16 text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Check className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium">No tasks here</p>
              <p className="text-sm mt-1">Add a task above to get started</p>
            </CardContent>
          </Card>
        ) : (
          sortedTasks.map((task, index) => {
            const overdue = isOverdue(task);
            
            return (
              <Card
                key={task.id}
                className={cn(
                  "card-shadow hover-lift transition-all duration-200 border-l-4",
                  priorityConfig[task.priority].border,
                  task.completed && "opacity-60",
                  overdue && "bg-destructive/5 border-l-destructive"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <CardContent className="py-4 flex items-center gap-4">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                      task.completed
                        ? "bg-success border-success"
                        : "border-muted-foreground/30 hover:border-primary hover:scale-110"
                    )}
                  >
                    {task.completed && <Check className="h-3.5 w-3.5 text-success-foreground" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "block font-medium transition-all",
                        task.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <div className={cn(
                        "flex items-center gap-1 mt-1 text-xs",
                        overdue ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {overdue && <AlertCircle className="h-3 w-3" />}
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(task.dueDate)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover" align="end">
                        <CalendarComponent
                          mode="single"
                          selected={task.dueDate ? parseISO(task.dueDate) : undefined}
                          onSelect={(date) => updateTaskDueDate(task.id, date)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>

                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium hidden sm:inline-flex",
                        priorityConfig[task.priority].color,
                        priorityConfig[task.priority].bg
                      )}
                    >
                      {priorityConfig[task.priority].label}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
