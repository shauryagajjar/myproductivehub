import { Heart, Lightbulb, ExternalLink } from 'lucide-react';

const tips = [
  "Break large tasks into smaller, manageable chunks",
  "Take regular breaks to maintain focus",
  "Review your habits weekly to stay on track",
  "Use the Pomodoro technique for deep work sessions",
  "Keep your quick links updated with frequently used sites",
  "Start your day with the most important task",
  "Celebrate small wins to stay motivated",
];

export function Footer() {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <footer className="border-t bg-card/50 py-4 px-6">
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-warning/10 flex items-center justify-center">
            <Lightbulb className="h-3.5 w-3.5 text-warning" />
          </div>
          <span className="hidden md:inline">Pro tip:</span>
          <span>{randomTip}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span>Built with</span>
          <Heart className="h-3 w-3 text-destructive fill-destructive" />
          <span>for productivity</span>
        </div>
      </div>
    </footer>
  );
}
