import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Task } from '../types/Task';

const taskService = {
  // Observar mudanças nas tarefas
  subscribeToTasks(callback: (tasks: Task[]) => void) {
    try {
      const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate() || new Date(),
            endDate: data.endDate?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Task;
        });
        callback(tasks);
      }, (error) => {
        console.error('Erro ao observar tarefas:', error);
      });
    } catch (error) {
      console.error('Erro ao configurar observador de tarefas:', error);
      return () => {};
    }
  },

  // Adicionar nova tarefa
  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...task,
        startDate: Timestamp.fromDate(task.startDate),
        endDate: task.endDate ? Timestamp.fromDate(task.endDate) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      throw error;
    }
  },

  // Atualizar tarefa
  async updateTask(taskId: string, updates: Partial<Task>) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        endDate: updates.endDate ? Timestamp.fromDate(updates.endDate) : null,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  },

  // Deletar tarefa
  async deleteTask(taskId: string) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw error;
    }
  },

  // Upload de imagem
  async uploadImage(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `tasks/${filename}`);
      
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      
      return downloadUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  },
};

export default taskService; 