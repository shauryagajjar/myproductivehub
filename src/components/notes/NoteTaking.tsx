import { useState } from 'react';
import { Plus, Search, Trash2, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

export function NoteTaking() {
  const [notes, setNotes] = useLocalStorage<Note[]>('productivity-notes', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const addNote = () => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [note, ...prev]);
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(true);
  };

  const updateNote = () => {
    if (!selectedNote) return;

    setNotes(prev =>
      prev.map(note =>
        note.id === selectedNote.id
          ? {
              ...note,
              title: editTitle || 'Untitled Note',
              content: editContent,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
    setSelectedNote(prev =>
      prev
        ? {
            ...prev,
            title: editTitle || 'Untitled Note',
            content: editContent,
            updatedAt: new Date().toISOString(),
          }
        : null
    );
    setIsEditing(false);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const filteredNotes = notes.filter(
    note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Notes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={addNote}>
          <Plus className="h-4 w-4 mr-1" />
          New Note
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="lg:col-span-1 space-y-2 max-h-[60vh] overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No notes yet</p>
                <p className="text-sm">Create one to get started</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotes.map((note, index) => (
              <Card
                key={note.id}
                className={cn(
                  "card-shadow cursor-pointer transition-all hover:border-primary/50",
                  selectedNote?.id === note.id && "border-primary bg-primary/5"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  setSelectedNote(note);
                  setEditTitle(note.title);
                  setEditContent(note.content);
                  setIsEditing(false);
                }}
              >
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">{note.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {note.content || 'No content'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(note.updatedAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Note Editor */}
        <div className="lg:col-span-2">
          {selectedNote ? (
            <Card className="card-shadow-lg h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <Input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      placeholder="Note title..."
                      className="text-lg font-medium border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                  ) : (
                    <CardTitle
                      className="cursor-pointer"
                      onClick={() => setIsEditing(true)}
                    >
                      {selectedNote.title}
                    </CardTitle>
                  )}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button size="sm" onClick={updateNote}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="Start writing..."
                    className="min-h-[300px] resize-none"
                  />
                ) : (
                  <div
                    className="min-h-[300px] whitespace-pre-wrap text-sm cursor-pointer"
                    onClick={() => setIsEditing(true)}
                  >
                    {selectedNote.content || (
                      <span className="text-muted-foreground">
                        Click to add content...
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="card-shadow-lg h-full min-h-[400px]">
              <CardContent className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a note to view</p>
                  <p className="text-sm">or create a new one</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
