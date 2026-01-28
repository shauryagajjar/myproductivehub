import { Heart, Lightbulb } from 'lucide-react';

const tips = [
  "Break large tasks into smaller, manageable chunks",
  "Take regular breaks to maintain focus",
  "Review your habits weekly to stay on track",
  "Use the Pomodoro technique for deep work sessions",
  "Keep your quick links updated with frequently used sites",
];

export function Footer() {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <footer className="border-t bg-card/50 py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning" />
          <span>{randomTip}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Built with</span>
          <Heart className="h-3 w-3 text-destructive fill-destructive" />
          <span>for productivity</span>
        </div>
      </div>
    </footer>
  );
}
