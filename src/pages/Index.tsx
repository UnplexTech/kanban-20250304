
import React from 'react';
import KanbanBoard from '../components/KanbanBoard';
import { DropResult } from 'react-beautiful-dnd';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <KanbanBoard />
    </div>
  );
};

export default Index;
