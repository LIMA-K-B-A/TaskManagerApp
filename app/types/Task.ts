import { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  imageUrl?: string;
  startDate: Date;
  endDate?: Date;
  isCompleted: boolean;
  timeSpent?: number; // em segundos
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export default Task; 