import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { Task } from '../types/Task';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onComplete: () => void;
}

export default function TaskItem({ task, onPress, onComplete }: TaskItemProps) {
  const [timeSpent, setTimeSpent] = useState(task.timeSpent || 0);
  const [isRunning, setIsRunning] = useState(!task.isCompleted);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isRunning && !task.isCompleted) {
      intervalRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, task.isCompleted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  const handleComplete = () => {
    setIsRunning(false);
    onComplete();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.content} onPress={handlePress}>
        <View style={styles.imageContainer}>
          {task.imageUrl ? (
            <Image source={{ uri: task.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={30} color="#666" />
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, task.isCompleted && styles.completedTitle]}>
            {task.title}
          </Text>
          <Text style={styles.date}>
            <Ionicons name="calendar-outline" size={16} color="#666" />{' '}
            {format(task.startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </Text>
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={16} color="#007AFF" />
            <Text style={styles.timer}>{formatTime(timeSpent)}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.completeButton, task.isCompleted && styles.completedButton]}
        onPress={handleComplete}
      >
        <Ionicons
          name={task.isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
          size={24}
          color="#fff"
        />
        <Text style={styles.completeButtonText}>
          {task.isCompleted ? 'Concluído' : 'Concluir'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  timer: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedButton: {
    backgroundColor: '#34C759',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
}); 