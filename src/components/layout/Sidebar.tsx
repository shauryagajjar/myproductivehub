import { LayoutDashboard, CheckSquare, Timer, FileText, Target, Link2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Section } from '@/types';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { id: 'dashboard' as Section, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks' as Section, label: 'Tasks', icon: CheckSquare },
  { id: 'pomodoro' as Section, label: 'Pomodoro', icon: Timer },
  { id: 'notes' as Section, label: 'Notes', icon: FileText },
  { id: 'habits' as Section, label: 'Habits', icon: Target },
  { id: 'links' as Section, label: 'Quick Links', icon: Link2 },
];

export function Sidebar({ activeSection, onSectionChange, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 bg-sidebar border-r transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center justify-between lg:hidden mb-6">
            <span className="font-semibold text-lg">Navigation</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-1"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "animate-scale-in")} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4">
              <p className="text-sm font-medium mb-1">💡 Pro Tip</p>
              <p className="text-xs text-muted-foreground">
                Press 1-6 to quickly switch between sections
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
