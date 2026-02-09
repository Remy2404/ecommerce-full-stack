'use client';

import { useState, useCallback } from 'react';
import { MessageSquare, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AdminNote } from '@/types/order-intelligence';

interface AdminNotesProps {
  notes: AdminNote[];
  orderId: string;
  onAddNote?: (content: string) => Promise<void>;
  onEditNote?: (noteId: string, content: string) => Promise<void>;
  onDeleteNote?: (noteId: string) => Promise<void>;
  className?: string;
}

/**
 * UI for internal admin notes (future-ready)
 */
export function AdminNotes({
  notes,
  orderId,
  onAddNote,
  onEditNote,
  onDeleteNote,
  className,
}: AdminNotesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = useCallback(async () => {
    if (!newNote.trim() || !onAddNote) return;

    setIsSubmitting(true);
    try {
      await onAddNote(newNote.trim());
      setNewNote('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [newNote, onAddNote]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4" />
          Admin Notes
          <span className="text-muted-foreground">({notes.length})</span>
        </h3>
        {onAddNote && !isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Note
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="rounded-lg border bg-card p-3 space-y-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter note..."
            className="w-full min-h-[80px] resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={!newNote.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Note'
              )}
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 && !isAdding ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No notes yet. {onAddNote && 'Add the first note.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border bg-card p-3 space-y-2"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                <div className="flex gap-1">
                  {onEditNote && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onEditNote(note.id, note.content)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                  {onDeleteNote && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => onDeleteNote(note.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{note.createdBy}</span>
                <span>•</span>
                <time>{new Date(note.createdAt).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
