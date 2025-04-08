import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { Task } from '../types/Task';
import NewTaskForm from '../components/NewTaskForm';
import Modal from '../components/Modal';
import { router } from 'expo-router';
import taskService from '../services/taskService';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTasks, setActiveTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const unsubscribeTasks = taskService.subscribeToTasks((tasksData) => {
          console.log('Recebidas tarefas:', tasksData);
          setTasks(tasksData);
          setActiveTasks(tasksData.filter(task => !task.isCompleted).length);
          setCompletedTasks(tasksData.filter(task => task.isCompleted).length);
          setLoading(false);
          setError(null);
        });

        return () => {
          unsubscribeTasks();
          setLoading(false);
        };
      } catch (error) {
        console.error('Erro ao configurar observador:', error);
        setError('Erro ao carregar tarefas. Tente novamente.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      checkTaskTimeouts();
    }, 1000);

    return () => clearInterval(timer);
  }, [tasks]);

  const checkTaskTimeouts = async () => {
    const now = new Date();
    for (const task of tasks) {
      if (!task.isCompleted && task.endDate) {
        const endDate = task.endDate;
        if (now >= endDate) {
          try {
            await taskService.updateTask(task.id, {
              isCompleted: true,
            });
          } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
          }
        }
      }
    }
  };

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      setError(null);
      await taskService.addTask(taskData);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      setError('Erro ao adicionar tarefa. Tente novamente.');
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      setError(null);
      await taskService.updateTask(task.id, {
        isCompleted: !task.isCompleted,
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      setError('Erro ao atualizar tarefa. Tente novamente.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setError(null);
      await taskService.deleteTask(taskId);
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      setError('Erro ao deletar tarefa. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError('Erro ao fazer logout. Tente novamente.');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getRemainingTime = (task: Task) => {
    if (!task.endDate) return null;
    const now = new Date();
    const endDate = task.endDate;
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Tempo esgotado!';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderTask = ({ item: task }: { item: Task }) => (
    <View style={[styles.taskItem, task.isCompleted && styles.completedTask]}>
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            {task.imageUrl && (
              <Image source={{ uri: task.imageUrl }} style={styles.taskImage} />
            )}
            <View style={styles.taskInfo}>
              <Text style={[styles.taskTitle, task.isCompleted && styles.completedTaskTitle]}>
                {task.title}
              </Text>
              <Text style={styles.taskDate}>
                Data de início: {task.startDate.toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.taskActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleTask(task)}
            >
              <Ionicons
                name={task.isCompleted ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={task.isCompleted ? "#4CAF50" : "#666"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteTask(task.id)}
            >
              <Ionicons name="trash-outline" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        </View>
        {!task.isCompleted && task.endDate && (
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.timerText}>
              {getRemainingTime(task)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.appName}>TaskUp</Text>
          <View style={styles.headerActions}>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>Minhas Tarefas</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#fff" />
              <Text style={styles.statText}>{activeTasks} Ativas</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.statText}>{completedTasks} Concluídas</Text>
            </View>
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando tarefas...</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
          <Text style={styles.emptySubtext}>Clique no botão + para adicionar uma nova tarefa</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
        <NewTaskForm
          onSubmit={handleAddTask}
          onCancel={() => setIsModalVisible(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  currentTime: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
  },
  headerBottom: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  completedTask: {
    backgroundColor: '#f8f8f8',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDate: {
    fontSize: 14,
    color: '#666',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoutButton: {
    padding: 8,
  },
});
