import { CheckSquare, Timer, FileText, Target, Link2, X } from 'lucide-react';
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
          "fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between lg:hidden mb-4">
            <span className="font-medium">Navigation</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="space-y-1">
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
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>💡 Tip: Use keyboard shortcuts</p>
              <p className="text-[10px]">Press 1-5 to switch sections</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
