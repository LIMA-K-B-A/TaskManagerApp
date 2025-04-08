import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../config/firebase';
import { Task } from '../types/Task';

const taskService = {
  // Observar mudanças nas tarefas
  subscribeToTasks(callback: (tasks: Task[]) => void) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('Usuário não autenticado');
        return () => {};
      }

      console.log('Observando tarefas para o usuário:', user.uid);
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid)
      );

      return onSnapshot(q, (snapshot) => {
        console.log('Recebido snapshot com', snapshot.docs.length, 'documentos');
        const tasks = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          console.log('Processando documento:', doc.id, data);
          
          // Converter timestamps para Date
          const startDate = data.startDate?.toDate() || new Date();
          const endDate = data.endDate?.toDate() || null;
          const createdAt = data.createdAt?.toDate() || new Date();
          const updatedAt = data.updatedAt?.toDate() || new Date();

          const task = {
            id: doc.id,
            title: data.title || '',
            imageUrl: data.imageUrl || null,
            startDate,
            endDate,
            isCompleted: data.isCompleted || false,
            timeSpent: data.timeSpent || 0,
            createdAt,
            updatedAt,
            userId: data.userId
          } as Task;

          console.log('Tarefa processada:', task);
          return task;
        });

        // Ordenar as tarefas após o processamento
        tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        console.log('Tarefas processadas e ordenadas:', tasks);
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
  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('Usuário não autenticado ao tentar adicionar tarefa');
        throw new Error('Usuário não autenticado');
      }

      if (!task.title?.trim()) {
        throw new Error('O título da tarefa é obrigatório');
      }

      if (!task.startDate) {
        throw new Error('A data de início é obrigatória');
      }

      console.log('Adicionando tarefa para o usuário:', user.uid);
      console.log('Dados recebidos:', task);

      const taskData = {
        ...task,
        title: task.title.trim(),
        userId: user.uid,
        startDate: Timestamp.fromDate(task.startDate),
        endDate: task.endDate ? Timestamp.fromDate(task.endDate) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isCompleted: false,
        timeSpent: 0
      };
      
      console.log('Dados da tarefa a serem salvos:', taskData);
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      console.log('Tarefa adicionada com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      throw error;
    }
  },

  // Atualizar tarefa
  async updateTask(taskId: string, updates: Partial<Task>) {
    try {
      console.log('Atualizando tarefa:', taskId);
      console.log('Dados de atualização:', updates);

      const taskRef = doc(db, 'tasks', taskId);
      const updateData = {
        ...updates,
        endDate: updates.endDate ? Timestamp.fromDate(updates.endDate) : null,
        updatedAt: Timestamp.now(),
      };

      console.log('Dados a serem salvos:', updateData);
      await updateDoc(taskRef, updateData);
      console.log('Tarefa atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  },

  // Deletar tarefa
  async deleteTask(taskId: string) {
    try {
      console.log('Deletando tarefa:', taskId);
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
      console.log('Tarefa deletada com sucesso');
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw error;
    }
  },

  // Upload de imagem
  async uploadImage(uri: string): Promise<string> {
    try {
      console.log('Iniciando upload de imagem:', uri);
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `${Date.now()}-${uri.substring(uri.lastIndexOf('/') + 1)}`;
      const storageRef = ref(storage, `tasks/${filename}`);
      
      console.log('Fazendo upload para:', filename);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      
      console.log('Upload concluído. URL:', downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  },
};

export default taskService; 