import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import KanbanCard from './KanbanCard';
import { ColumnType, CardType } from './KanbanBoard';
import { Plus, MoreHorizontal } from 'lucide-react';

interface KanbanColumnProps {
  column: ColumnType;
  index: number;
  addCard: (columnId: string, title: string) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  editCard: (columnId: string, cardId: string, title: string, description?: string, user?: string, responsibilities?: string[]) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  column, 
  index, 
  addCard, 
  deleteCard,
  editCard
}) => {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;
    addCard(column.id, newCardTitle);
    setNewCardTitle('');
    setIsAddingCard(false);
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="kanban-column bg-card rounded-lg shadow-sm shrink-0 w-72 mx-2 flex flex-col max-h-full"
        >
          <div 
            className="px-3 py-3 font-medium flex items-center justify-between border-b border-border/50"
            {...provided.dragHandleProps}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/70"></div>
              <h3 className="font-medium text-sm">{column.title}</h3>
              <span className="text-xs text-muted-foreground ml-1">
                {column.cards.length}
              </span>
            </div>
            <button className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <Droppable droppableId={column.id} type="CARD">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 p-2 overflow-y-auto transition-colors ${
                  snapshot.isDraggingOver ? 'bg-accent/50' : ''
                }`}
                style={{ minHeight: '50px' }}
              >
                {column.cards.map((card, index) => (
                  <KanbanCard 
                    key={card.id} 
                    card={card} 
                    index={index} 
                    columnId={column.id}
                    deleteCard={deleteCard}
                    editCard={editCard}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="p-3 pt-1 border-t border-border/50">
            {isAddingCard ? (
              <div className="animate-fade-in">
                <textarea
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter a title for this card..."
                  className="w-full p-2 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none text-sm"
                  rows={2}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCard();
                    }
                  }}
                />
                <div className="flex mt-2 gap-2">
                  <button 
                    onClick={handleAddCard}
                    className="px-3 py-1 rounded text-xs bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Add Card
                  </button>
                  <button 
                    onClick={() => setIsAddingCard(false)}
                    className="px-3 py-1 rounded text-xs bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/90"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className="add-button flex items-center gap-1 w-full rounded p-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-4 h-4" /> Add a card
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanColumn;
