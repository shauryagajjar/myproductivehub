import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { TaskManager } from '@/components/tasks/TaskManager';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { NoteTaking } from '@/components/notes/NoteTaking';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { QuickLinks } from '@/components/links/QuickLinks';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Section } from '@/types';

export default function Index() {
  const [activeSection, setActiveSection] = useLocalStorage<Section>('productivity-section', 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const sectionKeys: Record<string, Section> = {
        '1': 'dashboard',
        '2': 'tasks',
        '3': 'pomodoro',
        '4': 'notes',
        '5': 'habits',
        '6': 'links',
      };

      if (sectionKeys[e.key]) {
        setActiveSection(sectionKeys[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveSection]);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveSection} />;
      case 'tasks':
        return <TaskManager />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'notes':
        return <NoteTaking />;
      case 'habits':
        return <HabitTracker />;
      case 'links':
        return <QuickLinks />;
      default:
        return <Dashboard onNavigate={setActiveSection} />;
    }
  };

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
            {renderSection()}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
