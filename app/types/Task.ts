import { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  imageUrl?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  isCompleted: boolean;
  timeSpent?: number; // em segundos
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default Task; 