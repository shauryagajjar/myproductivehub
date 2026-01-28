import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { TaskManager } from '@/components/tasks/TaskManager';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { NoteTaking } from '@/components/notes/NoteTaking';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { QuickLinks } from '@/components/links/QuickLinks';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Section } from '@/types';

const sectionComponents: Record<Section, React.ComponentType> = {
  tasks: TaskManager,
  pomodoro: PomodoroTimer,
  notes: NoteTaking,
  habits: HabitTracker,
  links: QuickLinks,
};

export default function Index() {
  const [activeSection, setActiveSection] = useLocalStorage<Section>('productivity-section', 'tasks');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const sectionKeys: Record<string, Section> = {
        '1': 'tasks',
        '2': 'pomodoro',
        '3': 'notes',
        '4': 'habits',
        '5': 'links',
      };

      if (sectionKeys[e.key]) {
        setActiveSection(sectionKeys[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveSection]);

  const ActiveComponent = sectionComponents[activeSection];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <ActiveComponent />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
