import { useState } from 'react';
import { Plus, Trash2, Check, Circle, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import type { Task, Priority } from '@/types';

const priorityConfig = {
  high: { label: 'High', color: 'text-priority-high', bg: 'bg-priority-high/10' },
  medium: { label: 'Medium', color: 'text-priority-medium', bg: 'bg-priority-medium/10' },
  low: { label: 'Low', color: 'text-priority-low', bg: 'bg-priority-low/10' },
};

export function TaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('productivity-tasks', []);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.trim(),
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [task, ...prev]);
    setNewTask('');
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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {completedCount} of {tasks.length} completed
          </p>
        </div>
      </div>

      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="flex gap-3 flex-col sm:flex-row">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as Priority[]).map(p => (
                <Button
                  key={p}
                  variant={priority === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "capitalize",
                    priority === p && priorityConfig[p].color
                  )}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  {p}
                </Button>
              ))}
            </div>
            <Button onClick={addTask} className="shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {(['all', 'active', 'completed'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No tasks yet. Add one above!</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task, index) => (
            <Card
              key={task.id}
              className={cn(
                "card-shadow hover-lift transition-all duration-200",
                task.completed && "opacity-60"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="py-3 flex items-center gap-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    task.completed
                      ? "bg-success border-success"
                      : "border-muted-foreground/30 hover:border-primary"
                  )}
                >
                  {task.completed && <Check className="h-3 w-3 text-success-foreground" />}
                </button>

                <span
                  className={cn(
                    "flex-1 transition-all",
                    task.completed && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </span>

                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
