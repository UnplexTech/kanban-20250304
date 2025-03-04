
import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { CardType } from './KanbanBoard';
import { X, Edit2, CheckSquare, Trash2 } from 'lucide-react';

interface KanbanCardProps {
  card: CardType;
  index: number;
  columnId: string;
  deleteCard: (columnId: string, cardId: string) => void;
  editCard: (columnId: string, cardId: string, title: string, description?: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ 
  card, 
  index, 
  columnId,
  deleteCard,
  editCard 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [showActions, setShowActions] = useState(false);
  const outsideRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (outsideRef.current && !outsideRef.current.contains(event.target as Node)) {
      setShowActions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSave = () => {
    if (title.trim()) {
      editCard(columnId, card.id, title, description.trim() || undefined);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    deleteCard(columnId, card.id);
  };

  if (isEditing) {
    return (
      <div className="p-3 mb-2 bg-card rounded-lg shadow-sm border border-border/50 animate-scale-in">
        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter card title..."
            className="w-full p-2 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a more detailed description..."
            className="w-full p-2 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none text-sm"
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-1">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 rounded text-xs bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-2 py-1 rounded text-xs bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`kanban-card relative p-3 mb-2 bg-card rounded-lg ${
            snapshot.isDragging ? 'shadow-md' : 'shadow-sm'
          } ${
            card.description ? 'border-l-2 border-primary/30' : ''
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => !snapshot.isDragging && setShowActions(false)}
        >
          <div className="text-sm font-medium mb-1">{card.title}</div>
          
          {card.description && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {card.description}
            </div>
          )}
          
          {showActions && (
            <div 
              ref={outsideRef}
              className={`absolute top-1 right-1 flex gap-1 p-1 rounded ${
                snapshot.isDragging ? 'bg-card' : 'bg-card/90 backdrop-blur-sm'
              } text-muted-foreground animate-fade-in z-10`}
            >
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-accent hover:text-foreground transition-colors"
                title="Edit"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button 
                onClick={handleDelete}
                className="p-1 rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
