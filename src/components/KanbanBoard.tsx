
import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import KanbanColumn from './KanbanColumn';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

// Define the data structure for our kanban board
export interface CardType {
  id: string;
  title: string;
  description?: string;
}

export interface ColumnType {
  id: string;
  title: string;
  cards: CardType[];
}

interface KanbanBoardProps {
  initialData?: ColumnType[];
}

const defaultData: ColumnType[] = [
  {
    id: 'column-1',
    title: 'To Do',
    cards: [
      { id: 'card-1', title: 'Create design system', description: 'Define colors, typography and components' },
      { id: 'card-2', title: 'Implement drag and drop', description: 'Use react-beautiful-dnd for smooth interactions' },
    ],
  },
  {
    id: 'column-2',
    title: 'In Progress',
    cards: [
      { id: 'card-3', title: 'Build UI components', description: 'Create the visual elements of the application' },
    ],
  },
  {
    id: 'column-3',
    title: 'Done',
    cards: [
      { id: 'card-4', title: 'Project setup', description: 'Initialize the project and install dependencies' },
    ],
  },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ initialData = defaultData }) => {
  const [columns, setColumns] = useState<ColumnType[]>(initialData);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    // If there's no destination or the item was dropped back to its original position
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    // Handle column reordering
    if (type === 'COLUMN') {
      const newColumns = Array.from(columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);
      setColumns(newColumns);
      return;
    }

    // Handle card reordering
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    // If moving within the same column
    if (source.droppableId === destination.droppableId) {
      const newCards = Array.from(sourceColumn.cards);
      const [removed] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, removed);

      setColumns(
        columns.map(col => 
          col.id === source.droppableId ? { ...col, cards: newCards } : col
        )
      );
    } else {
      // Moving from one column to another
      const sourceCards = Array.from(sourceColumn.cards);
      const destCards = Array.from(destColumn.cards);
      const [removed] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, removed);

      setColumns(
        columns.map(col => {
          if (col.id === source.droppableId) return { ...col, cards: sourceCards };
          if (col.id === destination.droppableId) return { ...col, cards: destCards };
          return col;
        })
      );
      
      toast(`Moved "${removed.title}" to ${destColumn.title}`);
    }
  };

  // Add a new card to a column
  const addCard = (columnId: string, title: string) => {
    if (!title.trim()) return;
    
    const newCard: CardType = {
      id: `card-${Date.now()}`,
      title: title.trim(),
    };

    setColumns(
      columns.map(col => 
        col.id === columnId 
          ? { ...col, cards: [...col.cards, newCard] } 
          : col
      )
    );
  };

  // Add a new column to the board
  const addColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumn: ColumnType = {
      id: `column-${Date.now()}`,
      title: newColumnTitle.trim(),
      cards: [],
    };

    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  // Delete a card from a column
  const deleteCard = (columnId: string, cardId: string) => {
    setColumns(
      columns.map(col => 
        col.id === columnId 
          ? { ...col, cards: col.cards.filter(card => card.id !== cardId) } 
          : col
      )
    );
  };

  // Edit a card in a column
  const editCard = (columnId: string, cardId: string, title: string, description?: string) => {
    setColumns(
      columns.map(col => 
        col.id === columnId 
          ? { 
              ...col, 
              cards: col.cards.map(card => 
                card.id === cardId 
                  ? { ...card, title, description } 
                  : card
              ) 
            } 
          : col
      )
    );
  };

  return (
    <div className="h-screen overflow-y-hidden bg-background pt-6 pb-12 px-2 md:px-8">
      <div className="flex justify-between items-center mb-8 px-4">
        <h1 className="text-2xl font-semibold">Kanban Board</h1>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <div 
              className="flex items-start overflow-x-auto pb-8 pt-2 px-2" 
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ minHeight: 'calc(100vh - 180px)' }}
            >
              {columns.map((column, index) => (
                <KanbanColumn 
                  key={column.id}
                  column={column}
                  index={index}
                  addCard={addCard}
                  deleteCard={deleteCard}
                  editCard={editCard}
                />
              ))}
              {provided.placeholder}
              
              {isAddingColumn ? (
                <div className="bg-card rounded-lg shadow-sm shrink-0 w-72 mx-2 p-3 animate-scale-in">
                  <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Enter column title..."
                    className="w-full p-2 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addColumn();
                      if (e.key === 'Escape') setIsAddingColumn(false);
                    }}
                  />
                  <div className="flex mt-2 gap-2">
                    <button 
                      onClick={addColumn}
                      className="px-3 py-1 rounded text-sm bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Add
                    </button>
                    <button 
                      onClick={() => setIsAddingColumn(false)}
                      className="px-3 py-1 rounded text-sm bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/90"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingColumn(true)}
                  className="add-button flex items-center justify-center gap-1 h-10 shrink-0 rounded-lg bg-secondary text-secondary-foreground px-4 mx-2 transition-all duration-200 animate-fade-in"
                >
                  <Plus className="w-4 h-4" /> Add Column
                </button>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
